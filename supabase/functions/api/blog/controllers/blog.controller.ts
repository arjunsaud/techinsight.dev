import type { Context } from "jsr:@hono/hono";

import { getOptionalAuth, requireAdmin } from "../../../shared/auth.ts";
import { createAuthClient, createPublicClient } from "../../../shared/client.ts";
import type { BlogPayload } from "../types.ts";
import {
  createBlogModel,
  createCategoryModel,
  createTagModel,
  deleteCategoryModel,
  deleteBlogModel,
  deleteTagModel,
  getBlogByIdOrSlugModel,
  getR2SettingsModel,
  listBlogsModel,
  listCategoriesModel,
  listTagsModel,
  updateCategoryModel,
  updateBlogModel,
  updateTagModel,
} from "../models/blog.model.ts";

function toPositiveInt(
  value: string | undefined,
  fallback: number,
  max?: number,
) {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  const integer = Math.floor(parsed);
  if (max !== undefined) {
    return Math.min(integer, max);
  }
  return integer;
}

export async function listBlogs(c: Context) {
  const maybeUser = await getOptionalAuth(c.req.raw);
  const isAdmin = maybeUser?.role === "admin" || maybeUser?.role === "superadmin";
  const supabase = maybeUser
    ? createAuthClient(maybeUser.accessToken)
    : createPublicClient();

  const result = await listBlogsModel(supabase, {
    page: toPositiveInt(c.req.query("page"), 1),
    pageSize: toPositiveInt(c.req.query("pageSize"), 10, 50),
    status: c.req.query("status") ?? null,
    queryText: c.req.query("query") ?? null,
    isAdmin,
  });

  return c.json(result);
}

export async function getBlog(c: Context) {
  const idOrSlug = c.req.param("idOrSlug");
  const maybeUser = await getOptionalAuth(c.req.raw);
  const supabase = maybeUser
    ? createAuthClient(maybeUser.accessToken)
    : createPublicClient();

  const data = await getBlogByIdOrSlugModel(supabase, idOrSlug);

  if (!data) {
    return c.json({ error: "Blog not found" }, 404);
  }

  return c.json(data);
}

export async function createBlog(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as BlogPayload;

  if (!payload.title || !payload.content) {
    return c.json({ error: "title and content are required" }, 422);
  }

  const data = await createBlogModel(supabase, admin.id, payload);
  return c.json(data, 201);
}

export async function updateBlog(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as Partial<BlogPayload>;

  const data = await updateBlogModel(
    supabase,
    c.req.param("idOrSlug"),
    payload,
  );
  if (!data) {
    return c.json({ error: "Blog not found" }, 404);
  }

  return c.json(data);
}

export async function deleteBlog(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);

  await deleteBlogModel(supabase, c.req.param("idOrSlug"));
  return c.body(null, 204);
}

export async function listCategories(c: Context) {
  const supabase = createPublicClient();
  const data = await listCategoriesModel(supabase);
  return c.json(data);
}

export async function createCategory(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { name?: string; slug?: string };

  if (!payload.name) {
    return c.json({ error: "name is required" }, 422);
  }

  const data = await createCategoryModel(supabase, payload);
  return c.json(data, 201);
}

export async function updateCategory(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { name?: string; slug?: string };

  if (!payload.name && !payload.slug) {
    return c.json({ error: "name or slug is required" }, 422);
  }

  const data = await updateCategoryModel(
    supabase,
    c.req.param("categoryId"),
    payload,
  );

  if (!data) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json(data);
}

export async function deleteCategory(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  await deleteCategoryModel(supabase, c.req.param("categoryId"));
  return c.body(null, 204);
}

export async function listTags(c: Context) {
  const supabase = createPublicClient();
  const data = await listTagsModel(supabase);
  return c.json(data);
}

export async function createTag(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { name?: string; slug?: string };

  if (!payload.name) {
    return c.json({ error: "name is required" }, 422);
  }

  const data = await createTagModel(supabase, payload);
  return c.json(data, 201);
}

export async function updateTag(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { name?: string; slug?: string };

  if (!payload.name && !payload.slug) {
    return c.json({ error: "name or slug is required" }, 422);
  }

  const data = await updateTagModel(supabase, c.req.param("tagId"), payload);

  if (!data) {
    return c.json({ error: "Tag not found" }, 404);
  }

  return c.json(data);
}

export async function deleteTag(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  await deleteTagModel(supabase, c.req.param("tagId"));
  return c.body(null, 204);
}

export async function createUploadDraft(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { filename?: string };

  const r2Settings = await getR2SettingsModel(supabase);
  const timestamp = Date.now();
  const sanitizedName = (payload.filename ?? "image.jpg").replace(
    /[^a-zA-Z0-9._-]/g,
    "-",
  );
  const objectKey = `blogs/${timestamp}-${sanitizedName}`;

  return c.json({
    objectKey,
    publicUrl: `${r2Settings.R2_PUBLIC_URL.replace(/\/$/, "")}/${objectKey}`,
    note: "Use objectKey with your R2 presigned upload implementation.",
  });
}
