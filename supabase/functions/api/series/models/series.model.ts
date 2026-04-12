import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { slugify } from "../../../shared/utils.ts";

export interface SeriesPayload {
  title: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  status?: "draft" | "published";
}

export interface SeriesPostPayload {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featuredImageUrl?: string;
  seriesOrder?: number;
  status?: "draft" | "published";
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
  showToc?: boolean;
  categoryId?: string;
  isFeatured?: boolean;
  tagIds?: string[];
}

const SERIES_SELECT = "id, title, slug, description, coverImage:cover_image, status, createdAt:created_at, updatedAt:updated_at";
const SERIES_POST_SELECT = "id, seriesId:series_id, title, slug, content, excerpt, featuredImageUrl:featured_image_url, seriesOrder:series_order, status, seoTitle:seo_title, metaDescription:meta_description, keywords, showToc:show_toc, publishedAt:published_at, createdAt:created_at, updatedAt:updated_at";

export async function listSeriesModel(
  supabase: SupabaseClient,
  filters: { status?: string; isAdmin?: boolean; page?: number; pageSize?: number } = {},
) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("series")
    .select(`
      ${SERIES_SELECT},
      posts:series_posts(count)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!filters.isAdmin) {
    query = query.eq("status", "published");
  } else if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const mappedData = (data ?? []).map((s: any) => ({
    ...s,
    postsCount: s.posts?.[0]?.count ?? 0,
    posts: undefined, // Clear the count object to keep clean
  }));

  return {
    data: mappedData,
    page,
    pageSize,
    total: count ?? 0,
  };
}

export async function getSeriesByIdOrSlugModel(
  supabase: SupabaseClient,
  idOrSlug: string,
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  const query = supabase
    .from("series")
    .select(`${SERIES_SELECT}`);

  if (isUuid) {
    query.eq("id", idOrSlug);
  } else {
    query.eq("slug", idOrSlug);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getSeriesWithPostsModel(
  supabase: SupabaseClient,
  idOrSlug: string,
) {
  const series = await getSeriesByIdOrSlugModel(supabase, idOrSlug);
  if (!series) return null;

  const { data: posts, error } = await supabase
    .from("series_posts")
    .select(SERIES_POST_SELECT)
    .eq("series_id", series.id)
    .order("series_order", { ascending: true });

  if (error) throw new Error(error.message);

  // Map tags for each post
  return {
    ...series,
    posts: posts ?? [],
  };
}

export async function createSeriesModel(
  supabase: SupabaseClient,
  payload: SeriesPayload,
) {
  const slug = payload.slug ? slugify(payload.slug) : slugify(payload.title);

  const { data, error } = await supabase
    .from("series")
    .insert({
      title: payload.title,
      slug,
      description: payload.description,
      cover_image: payload.coverImage,
      status: payload.status ?? "draft",
    })
    .select(SERIES_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSeriesModel(
  supabase: SupabaseClient,
  id: string,
  payload: Partial<SeriesPayload>,
) {
  const updates: any = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.slug !== undefined) updates.slug = slugify(payload.slug);
  if (payload.description !== undefined) updates.description = payload.description;
  if (payload.coverImage !== undefined) updates.cover_image = payload.coverImage;
  if (payload.status !== undefined) updates.status = payload.status;

  const { data, error } = await supabase
    .from("series")
    .update(updates)
    .eq("id", id)
    .select(SERIES_SELECT)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSeriesModel(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("series").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderSeriesPostsModel(
  supabase: SupabaseClient,
  seriesId: string,
  postIds: string[],
) {
  const { error } = await supabase.rpc("reorder_series_posts", {
    p_post_ids: postIds,
  });

  if (error) {
    console.error("Database reorder error:", error);
    throw new Error(`DB Error: ${error.message} (${error.code})`);
  }
}

export async function getSeriesPostBySlugModel(
  supabase: SupabaseClient,
  slug: string,
) {
  const { data, error } = await supabase
    .from("series_posts")
    .select(SERIES_POST_SELECT)
    .eq("slug", slug)
    .single();

  if (error) throw new Error(error.message);
  
  return data;
}

// standalone series posts model functions
export async function getSeriesPostByIdModel(
  supabase: SupabaseClient,
  postId: string,
) {
  const { data, error } = await supabase
    .from("series_posts")
    .select(SERIES_POST_SELECT)
    .eq("id", postId)
    .single();

  if (error) throw new Error(error.message);
  
  return data;
}

export async function createSeriesPostModel(
  supabase: SupabaseClient,
  seriesId: string,
  payload: SeriesPostPayload,
) {
  const slug = payload.slug ? slugify(payload.slug) : slugify(payload.title);

  const { data, error } = await supabase
    .from("series_posts")
    .insert({
      series_id: seriesId,
      title: payload.title,
      slug,
      content: payload.content,
      excerpt: payload.excerpt,
      featured_image_url: payload.featuredImageUrl,
      category_id: payload.categoryId,
      series_order: payload.seriesOrder ?? 0,
      status: payload.status ?? "draft",
      seo_title: payload.seoTitle,
      meta_description: payload.metaDescription,
      keywords: payload.keywords,
      show_toc: payload.showToc ?? false,
      published_at: payload.status === "published" ? new Date().toISOString() : null,
    })
    .select(SERIES_POST_SELECT)
    .single();

  if (error) throw new Error(error.message);

  // Handle tags if provided
  if (payload.tagIds && payload.tagIds.length > 0) {
    const { error: tagError } = await supabase.from("series_post_tags").insert(
      payload.tagIds.map((tagId) => ({
        series_post_id: data.id,
        tag_id: tagId,
      })),
    );

    if (tagError) {
      throw new Error(tagError.message);
    }
  }

  // Fetch the full post with tags
  const fullPost = await getSeriesPostByIdModel(supabase, data.id);
  if (!fullPost) {
    throw new Error("Failed to fetch created series post");
  }

  return fullPost;
}

export async function updateSeriesPostModel(
  supabase: SupabaseClient,
  postId: string,
  payload: Partial<SeriesPostPayload>,
) {
  const updates: any = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.slug !== undefined) updates.slug = slugify(payload.slug);
  if (payload.content !== undefined) updates.content = payload.content;
  if (payload.excerpt !== undefined) updates.excerpt = payload.excerpt;
  if (payload.featuredImageUrl !== undefined) updates.featured_image_url = payload.featuredImageUrl;
  if (payload.categoryId !== undefined) updates.category_id = payload.categoryId;
  if (payload.seriesOrder !== undefined) updates.series_order = payload.seriesOrder;
  if (payload.seoTitle !== undefined) updates.seo_title = payload.seoTitle;
  if (payload.metaDescription !== undefined) updates.meta_description = payload.metaDescription;
  if (payload.keywords !== undefined) updates.keywords = payload.keywords;
  if (payload.showToc !== undefined) updates.show_toc = payload.showToc;
  if (payload.status !== undefined) {
    updates.status = payload.status;
    if (payload.status === "published") {
      updates.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("series_posts")
    .update(updates)
    .eq("id", postId)
    .select(SERIES_POST_SELECT)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) {
    return null;
  }

  // Handle tags if provided
  if (payload.tagIds) {
    // Delete existing tags
    const { error: deleteTagsError } = await supabase
      .from("series_post_tags")
      .delete()
      .eq("series_post_id", postId);
    
    if (deleteTagsError) {
      throw new Error(deleteTagsError.message);
    }

    // Insert new tags if any
    if (payload.tagIds.length > 0) {
      const { error: insertTagsError } = await supabase
        .from("series_post_tags")
        .insert(
          payload.tagIds.map((tagId) => ({
            series_post_id: postId,
            tag_id: tagId,
          })),
        );

      if (insertTagsError) {
        throw new Error(insertTagsError.message);
      }
    }
  }

  // Fetch the full post with tags
  const fullPost = await getSeriesPostByIdModel(supabase, postId);
  return fullPost;
}

export async function deleteSeriesPostModel(
  supabase: SupabaseClient,
  postId: string,
) {
  const { error } = await supabase
    .from("series_posts")
    .delete()
    .eq("id", postId);

  if (error) throw new Error(error.message);
}

export async function getPostSeriesInfoModel(
  supabase: SupabaseClient,
  postSlug: string,
) {
  // Search for the post in series_posts
  const { data: post, error: postError } = await supabase
    .from("series_posts")
    .select(`
      id,
      seriesOrder:series_order,
      series:series (
        id,
        title,
        slug
      )
    `)
    .eq("slug", postSlug)
    .single();

  if (postError || !post) return null;

  const seriesId = (post.series as any).id;

  const { data: allPostsInSeries, error: countError } = await supabase
    .from("series_posts")
    .select("id, title, slug, seriesOrder:series_order")
    .eq("series_id", seriesId)
    .order("series_order", { ascending: true });

  if (countError) throw new Error(countError.message);

  const currentIndex = allPostsInSeries.findIndex((p: any) => p.id === post.id);
  const totalPosts = allPostsInSeries.length;

  const prevPost = currentIndex > 0 ? allPostsInSeries[currentIndex - 1] : null;
  const nextPost = currentIndex < totalPosts - 1 ? allPostsInSeries[currentIndex + 1] : null;

  return {
    series: post.series,
    seriesOrder: post.seriesOrder,
    totalInSeries: totalPosts,
    index: currentIndex + 1,
    prevPost: prevPost ? { title: prevPost.title, slug: prevPost.slug } : null,
    nextPost: nextPost ? { title: nextPost.title, slug: nextPost.slug } : null,
  };
}
