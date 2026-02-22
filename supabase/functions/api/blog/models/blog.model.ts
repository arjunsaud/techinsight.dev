import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

import type { BlogListFilters, BlogPayload, R2Settings } from "../types.ts";

const R2_SETTING_KEYS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
] as const;

const BLOG_SELECT =
  "id,title,slug,content,excerpt,category_id,featured_image_url,status,author_id,published_at,created_at,updated_at,category:categories(id,name,slug,created_at),tags:blog_tags(tag:tags(id,name,slug,created_at))";

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function getR2SettingsModel(
  supabase: SupabaseClient,
): Promise<R2Settings> {
  const { data, error } = await supabase.from("app_settings").select(
    "key,value",
  ).in("key", [...R2_SETTING_KEYS]);

  if (error) {
    throw new Error(error.message);
  }

  const settings = Object.fromEntries(
    (data ?? []).map((
      row: { key: string; value: string },
    ) => [row.key, row.value]),
  ) as Partial<R2Settings>;

  const missing = R2_SETTING_KEYS.filter((key) =>
    !settings[key] || settings[key]?.trim() === ""
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing R2 settings in app_settings: ${missing.join(", ")}`,
    );
  }

  return settings as R2Settings;
}

export async function listBlogsModel(
  supabase: SupabaseClient,
  filters: BlogListFilters,
) {
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("blogs")
    .select(BLOG_SELECT, { count: "exact" })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!filters.isAdmin) {
    query = query.eq("status", "published");
  } else if (filters.status === "draft" || filters.status === "published") {
    query = query.eq("status", filters.status);
  }

  if (filters.queryText) {
    query = query.or(
      `title.ilike.%${filters.queryText}%,excerpt.ilike.%${filters.queryText}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const mapped = (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    tags:
      (((row.tags as { tag: unknown }[] | null) ?? []).map((item) =>
        item.tag
      ) ?? []) as unknown[],
  }));

  return {
    data: mapped,
    page: filters.page,
    pageSize: filters.pageSize,
    total: count ?? 0,
  };
}

export async function getBlogByIdOrSlugModel(
  supabase: SupabaseClient,
  idOrSlug: string,
) {
  let query = supabase.from("blogs").select(BLOG_SELECT).maybeSingle();

  if (isUuid(idOrSlug)) {
    query = query.eq("id", idOrSlug);
  } else {
    query = query.eq("slug", idOrSlug);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    tags: ((data.tags as { tag: unknown }[] | null) ?? []).map((item) =>
      item.tag
    ),
  };
}

export async function createBlogModel(
  supabase: SupabaseClient,
  adminId: string,
  payload: BlogPayload,
) {
  const slug = payload.slug ? slugify(payload.slug) : slugify(payload.title);

  const { data, error } = await supabase
    .from("blogs")
    .insert({
      title: payload.title,
      slug,
      content: payload.content,
      excerpt: payload.excerpt,
      category_id: payload.categoryId,
      featured_image_url: payload.featuredImageUrl,
      status: payload.status,
      author_id: adminId,
      published_at: payload.status === "published"
        ? new Date().toISOString()
        : null,
    })
    .select(
      "id,title,slug,content,excerpt,category_id,featured_image_url,status,author_id,published_at,created_at,updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (payload.tagIds && payload.tagIds.length > 0) {
    const { error: tagError } = await supabase.from("blog_tags").insert(
      payload.tagIds.map((tagId) => ({
        blog_id: data.id,
        tag_id: tagId,
      })),
    );

    if (tagError) {
      throw new Error(tagError.message);
    }
  }

  return data;
}

export async function updateBlogModel(
  supabase: SupabaseClient,
  blogId: string,
  payload: Partial<BlogPayload>,
) {
  const updates: Record<string, unknown> = {};

  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.slug !== undefined) updates.slug = slugify(payload.slug);
  if (payload.content !== undefined) updates.content = payload.content;
  if (payload.excerpt !== undefined) updates.excerpt = payload.excerpt;
  if (payload.categoryId !== undefined) {
    updates.category_id = payload.categoryId;
  }
  if (payload.featuredImageUrl !== undefined) {
    updates.featured_image_url = payload.featuredImageUrl;
  }
  if (payload.status !== undefined) {
    updates.status = payload.status;
    updates.published_at = payload.status === "published"
      ? new Date().toISOString()
      : null;
  }

  const { data, error } = await supabase
    .from("blogs")
    .update(updates)
    .eq("id", blogId)
    .select(
      "id,title,slug,content,excerpt,category_id,featured_image_url,status,author_id,published_at,created_at,updated_at",
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  if (payload.tagIds) {
    const { error: deleteTagsError } = await supabase.from("blog_tags").delete()
      .eq("blog_id", blogId);
    if (deleteTagsError) {
      throw new Error(deleteTagsError.message);
    }

    if (payload.tagIds.length > 0) {
      const { error: insertTagsError } = await supabase.from("blog_tags")
        .insert(
          payload.tagIds.map((tagId) => ({
            blog_id: blogId,
            tag_id: tagId,
          })),
        );

      if (insertTagsError) {
        throw new Error(insertTagsError.message);
      }
    }
  }

  return data;
}

export async function deleteBlogModel(
  supabase: SupabaseClient,
  blogId: string,
) {
  const { error } = await supabase.from("blogs").delete().eq("id", blogId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listCategoriesModel(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("categories").select(
    "id,name,slug,created_at",
  ).order("name");
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function createCategoryModel(
  supabase: SupabaseClient,
  payload: { name?: string; slug?: string },
) {
  if (!payload.name) {
    throw new Error("name is required");
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: payload.name,
      slug: payload.slug ? slugify(payload.slug) : slugify(payload.name),
    })
    .select("id,name,slug,created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCategoryModel(
  supabase: SupabaseClient,
  categoryId: string,
  payload: { name?: string; slug?: string },
) {
  const updates: Record<string, unknown> = {};
  if (payload.name !== undefined) {
    updates.name = payload.name;
  }
  if (payload.slug !== undefined) {
    updates.slug = slugify(payload.slug);
  } else if (payload.name !== undefined) {
    updates.slug = slugify(payload.name);
  }

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", categoryId)
    .select("id,name,slug,created_at")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCategoryModel(
  supabase: SupabaseClient,
  categoryId: string,
) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listTagsModel(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("tags").select(
    "id,name,slug,created_at",
  ).order("name");
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function createTagModel(
  supabase: SupabaseClient,
  payload: { name?: string; slug?: string },
) {
  if (!payload.name) {
    throw new Error("name is required");
  }

  const { data, error } = await supabase
    .from("tags")
    .insert({
      name: payload.name,
      slug: payload.slug ? slugify(payload.slug) : slugify(payload.name),
    })
    .select("id,name,slug,created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateTagModel(
  supabase: SupabaseClient,
  tagId: string,
  payload: { name?: string; slug?: string },
) {
  const updates: Record<string, unknown> = {};
  if (payload.name !== undefined) {
    updates.name = payload.name;
  }
  if (payload.slug !== undefined) {
    updates.slug = slugify(payload.slug);
  } else if (payload.name !== undefined) {
    updates.slug = slugify(payload.name);
  }

  const { data, error } = await supabase
    .from("tags")
    .update(updates)
    .eq("id", tagId)
    .select("id,name,slug,created_at")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTagModel(
  supabase: SupabaseClient,
  tagId: string,
) {
  const { error } = await supabase.from("tags").delete().eq("id", tagId);
  if (error) {
    throw new Error(error.message);
  }
}
