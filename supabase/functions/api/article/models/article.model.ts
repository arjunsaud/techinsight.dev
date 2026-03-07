import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

import type {
  ArticleListFilters,
  ArticlePayload,
  CloudinarySettings,
} from "../types.ts";
import { isUuid, slugify } from "../../../shared/utils.ts";

const CLOUDINARY_SETTING_KEYS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_UPLOAD_PRESET",
] as const;

const ARTICLE_SELECT =
  "id,title,slug,content,excerpt,categoryId:category_id,featuredImageUrl:featured_image_url,status,authorId:author_id,publishedAt:published_at,createdAt:created_at,updatedAt:updated_at,seoTitle:seo_title,metaDescription:meta_description,keywords,isFeatured:is_featured,showToc:show_toc,category:categories(id,name,slug,createdAt:created_at),tags:article_tags(tag:tags(id,name,slug,createdAt:created_at))";

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

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters.isFeatured !== null) {
    query = query.eq("is_featured", filters.isFeatured);
  }

  if (filters.tagSlug) {
    // Correct way to filter by tag slug in Supabase JS with joined tables:
    // We use the joined ArticleTags table to check if any associated tag matches the slug.
    // Note: Due to Supabase's PostgREST behavior, sometimes it's cleaner to use a filter on the nested object if selecting it.
    query = query.eq("article_tags.tag.slug", filters.tagSlug);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const mapped = (data ?? []).map((row: any) => ({
    ...row,
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
      is_featured: payload.isFeatured || false,
      show_toc: payload.showToc || false,
    })
    .select(
      "id,title,slug,content,excerpt,categoryId:category_id,featuredImageUrl:featured_image_url,status,authorId:author_id,publishedAt:published_at,createdAt:created_at,updatedAt:updated_at,seoTitle:seo_title,metaDescription:meta_description,keywords,isFeatured:is_featured,showToc:show_toc",
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

  const fullArticle = await getArticleByIdOrSlugModel(supabase, data.id);
  if (!fullArticle) {
    throw new Error("Failed to fetch created article");
  }

  return fullArticle;
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
  if (payload.isFeatured !== undefined)
    updates.is_featured = payload.isFeatured;
  if (payload.showToc !== undefined) updates.show_toc = payload.showToc;

  const { data, error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", articleId)
    .select(
      "id,title,slug,content,excerpt,categoryId:category_id,featuredImageUrl:featured_image_url,status,authorId:author_id,publishedAt:published_at,createdAt:created_at,updatedAt:updated_at,seoTitle:seo_title,metaDescription:meta_description,keywords,isFeatured:is_featured,showToc:show_toc",
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

  const fullArticle = await getArticleByIdOrSlugModel(supabase, articleId);
  if (!fullArticle) {
    return null;
  }

  return fullArticle;
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

export async function getRecommendedArticlesModel(supabase: SupabaseClient) {
  // Logic: Get up to 6 articles that are either featured or latest
  // Preference to featured articles
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(6);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    tags: (row.tags ?? []).map((item: any) => item.tag),
  }));
}
