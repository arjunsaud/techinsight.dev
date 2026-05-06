import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

import { slugify } from "../../../shared/utils.ts";

export async function listCategoriesModel(
  supabase: SupabaseClient,
  page = 1,
  pageSize = 100,
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("categories")
    .select("id,name,slug,description,color,createdAt:created_at, articles(count), series_posts(count)", { count: "exact" })
    .order("name")
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const mappedData = (data ?? []).map((cat: any) => ({
    ...cat,
    articleCount: (cat.articles?.[0]?.count ?? 0) + (cat.series_posts?.[0]?.count ?? 0),
    articles: undefined,
    series_posts: undefined,
  }));

  return {
    data: mappedData,
    page,
    pageSize,
    total: count ?? 0,
  };
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
    .select("id,name,slug,createdAt:created_at")
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
    .select("id,name,slug,createdAt:created_at")
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
  // Check if used in articles
  const { count: articleCount, error: articleCountError } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (articleCountError) throw new Error(articleCountError.message);
  if (articleCount && articleCount > 0) {
    throw new Error(
      "Cannot delete category as it is currently used in articles.",
    );
  }

  // Check if used in series posts
  const { count: seriesCount, error: seriesCountError } = await supabase
    .from("series_posts")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (seriesCountError) throw new Error(seriesCountError.message);
  if (seriesCount && seriesCount > 0) {
    throw new Error(
      "Cannot delete category as it is currently used in series articles.",
    );
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);
  if (error) {
    throw new Error(error.message);
  }
}
