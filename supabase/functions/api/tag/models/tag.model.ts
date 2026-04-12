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
    .select("id,name,slug,createdAt:created_at", { count: "exact" })
    .order("name")
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data ?? [],
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
  const { error } = await supabase.from("tags").delete().eq("id", tagId);
  if (error) {
    throw new Error(error.message);
  }
}
