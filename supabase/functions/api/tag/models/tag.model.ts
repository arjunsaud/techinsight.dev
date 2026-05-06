import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

import { slugify } from "../../../shared/utils.ts";

export async function listTagsModel(
  supabase: SupabaseClient,
  page = 1,
  pageSize = 100,
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("tags")
    .select("id,name,slug,createdAt:created_at, article_tags(count), series_post_tags(count)", { count: "exact" })
    .order("name")
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const mappedData = (data ?? []).map((tag: any) => ({
    ...tag,
    articleCount: (tag.article_tags?.[0]?.count ?? 0) + (tag.series_post_tags?.[0]?.count ?? 0),
    article_tags: undefined,
    series_post_tags: undefined,
  }));

  return {
    data: mappedData,
    page,
    pageSize,
    total: count ?? 0,
  };
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
    .select("id,name,slug,createdAt:created_at")
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
    .select("id,name,slug,createdAt:created_at")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTagModel(supabase: SupabaseClient, tagId: string) {
  // Check if used in articles
  const { count: articleCount, error: articleCountError } = await supabase
    .from("article_tags")
    .select("*", { count: "exact", head: true })
    .eq("tag_id", tagId);

  if (articleCountError) throw new Error(articleCountError.message);
  if (articleCount && articleCount > 0) {
    throw new Error("Cannot delete tag as it is currently used in articles.");
  }

  // Check if used in series posts
  const { count: seriesCount, error: seriesCountError } = await supabase
    .from("series_post_tags")
    .select("*", { count: "exact", head: true })
    .eq("tag_id", tagId);

  if (seriesCountError) throw new Error(seriesCountError.message);
  if (seriesCount && seriesCount > 0) {
    throw new Error(
      "Cannot delete tag as it is currently used in series articles.",
    );
  }

  const { error } = await supabase.from("tags").delete().eq("id", tagId);
  if (error) {
    throw new Error(error.message);
  }
}
