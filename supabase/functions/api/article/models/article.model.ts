import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

import type {
  ArticleListFilters,
  ArticlePayload,
  CloudinarySettings,
} from "../types.ts";

const CLOUDINARY_SETTING_KEYS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_UPLOAD_PRESET",
] as const;

const ARTICLE_SELECT =
  "id,title,slug,content,excerpt,category_id,featured_image_url,status,author_id,published_at,created_at,updated_at,seo_title,meta_description,keywords,category:categories(id,name,slug,created_at),tags:article_tags(tag:tags(id,name,slug,created_at))";

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

export async function getCloudinarySettingsModel(
  supabase: SupabaseClient,
): Promise<CloudinarySettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key,value")
    .in("key", [...CLOUDINARY_SETTING_KEYS]);

  if (error) {
    throw new Error(error.message);
  }

  const settings = Object.fromEntries(
    (data ?? []).map((row: { key: string; value: string }) => [
      row.key,
      row.value,
    ]),
  ) as Partial<CloudinarySettings>;

  const missing = CLOUDINARY_SETTING_KEYS.filter(
    (key) =>
      key !== "CLOUDINARY_UPLOAD_PRESET" &&
      (!settings[key] || settings[key]?.trim() === ""),
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing Cloudinary settings in app_settings: ${missing.join(", ")}`,
    );
  }

  return settings as CloudinarySettings;
}

export async function listArticlesModel(
  supabase: SupabaseClient,
  filters: ArticleListFilters,
) {
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("articles")
    .select(ARTICLE_SELECT, { count: "exact" })
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
  if (error) throw new Error(error.message);

  const mapped = (data ?? []).map((row: any) => ({
    ...row,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    keywords: row.keywords,
    tags: (row.tags ?? []).map((item: any) => item.tag),
  }));

  return {
    data: mapped,
    page: filters.page,
    pageSize: filters.pageSize,
    total: count ?? 0,
  };
}

export async function getArticleByIdOrSlugModel(
  supabase: SupabaseClient,
  idOrSlug: string,
) {
  let query = supabase.from("articles").select(ARTICLE_SELECT).maybeSingle();

  if (isUuid(idOrSlug)) {
    query = query.eq("id", idOrSlug);
  } else {
    query = query.eq("slug", idOrSlug);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    ...data,
    seoTitle: (data as any).seo_title,
    metaDescription: (data as any).meta_description,
    keywords: (data as any).keywords,
    tags: ((data.tags as { tag: unknown }[] | null) ?? []).map(
      (item) => item.tag,
    ),
  };
}

export async function createArticleModel(
  supabase: SupabaseClient,
  adminId: string,
  payload: ArticlePayload,
) {
  const slug = payload.slug ? slugify(payload.slug) : slugify(payload.title);

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: payload.title,
      slug,
      content: payload.content,
      excerpt: payload.excerpt,
      category_id: payload.categoryId,
      featured_image_url: payload.featuredImageUrl,
      status: payload.status,
      author_id: adminId,
      published_at:
        payload.status === "published" ? new Date().toISOString() : null,
      seo_title: payload.seoTitle,
      meta_description: payload.metaDescription,
      keywords: payload.keywords,
    })
    .select(
      "id,title,slug,content,excerpt,category_id,featured_image_url,status,author_id,published_at,created_at,updated_at,seo_title,meta_description,keywords",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (payload.tagIds && payload.tagIds.length > 0) {
    const { error: tagError } = await supabase.from("article_tags").insert(
      payload.tagIds.map((tagId) => ({
        article_id: data.id,
        tag_id: tagId,
      })),
    );

    if (tagError) {
      throw new Error(tagError.message);
    }
  }

  return {
    ...data,
    seoTitle: (data as any).seo_title,
    metaDescription: (data as any).meta_description,
    keywords: (data as any).keywords,
  };
}

export async function updateArticleModel(
  supabase: SupabaseClient,
  articleId: string,
  payload: Partial<ArticlePayload>,
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
    updates.published_at =
      payload.status === "published" ? new Date().toISOString() : null;
  }
  if (payload.seoTitle !== undefined) updates.seo_title = payload.seoTitle;
  if (payload.metaDescription !== undefined) {
    updates.meta_description = payload.metaDescription;
  }
  if (payload.keywords !== undefined) updates.keywords = payload.keywords;

  const { data, error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", articleId)
    .select(
      "id,title,slug,content,excerpt,category_id,featured_image_url,status,author_id,published_at,created_at,updated_at,seo_title,meta_description,keywords",
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  if (payload.tagIds) {
    const { error: deleteTagsError } = await supabase
      .from("article_tags")
      .delete()
      .eq("article_id", articleId);
    if (deleteTagsError) {
      throw new Error(deleteTagsError.message);
    }

    if (payload.tagIds.length > 0) {
      const { error: insertTagsError } = await supabase
        .from("article_tags")
        .insert(
          payload.tagIds.map((tagId) => ({
            article_id: articleId,
            tag_id: tagId,
          })),
        );

      if (insertTagsError) {
        throw new Error(insertTagsError.message);
      }
    }
  }

  return {
    ...data,
    seoTitle: (data as any).seo_title,
    metaDescription: (data as any).meta_description,
    keywords: (data as any).keywords,
  };
}

export async function deleteArticleModel(
  supabase: SupabaseClient,
  articleId: string,
) {
  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId);
  if (error) {
    throw new Error(error.message);
  }
}

export async function listCategoriesModel(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,created_at")
    .order("name");
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
  const { data, error } = await supabase
    .from("tags")
    .select("id,name,slug,created_at")
    .order("name");
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

export async function deleteTagModel(supabase: SupabaseClient, tagId: string) {
  const { error } = await supabase.from("tags").delete().eq("id", tagId);
  if (error) {
    throw new Error(error.message);
  }
}
