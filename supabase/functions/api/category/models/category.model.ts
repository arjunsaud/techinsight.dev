import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

import { slugify } from "../../../shared/utils.ts";

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
