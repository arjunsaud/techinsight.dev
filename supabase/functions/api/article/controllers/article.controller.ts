import type { Context } from "jsr:@hono/hono";

import { getOptionalAuth, requireAdmin } from "../../../shared/auth.ts";
import {
  createAuthClient,
  createPublicClient,
} from "../../../shared/client.ts";
import type { ArticlePayload } from "../types.ts";
import {
  createArticleModel,
  createCategoryModel,
  createTagModel,
  deleteCategoryModel,
  deleteArticleModel,
  deleteTagModel,
  getArticleByIdOrSlugModel,
  getCloudinarySettingsModel,
  listArticlesModel,
  listCategoriesModel,
  listTagsModel,
  updateArticleModel,
  updateCategoryModel,
  updateTagModel,
} from "../models/article.model.ts";

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

export async function listArticles(c: Context) {
  const maybeUser = await getOptionalAuth(c.req.raw);
  const isAdmin =
    maybeUser?.role === "admin" || maybeUser?.role === "superadmin";
  const supabase = maybeUser
    ? createAuthClient(maybeUser.accessToken)
    : createPublicClient();

  const result = await listArticlesModel(supabase, {
    page: toPositiveInt(c.req.query("page"), 1),
    pageSize: toPositiveInt(c.req.query("pageSize"), 10, 50),
    status: c.req.query("status") ?? null,
    queryText: c.req.query("query") ?? null,
    isAdmin,
  });

  return c.json(result);
}

export async function getArticle(c: Context) {
  const idOrSlug = c.req.param("idOrSlug");
  const maybeUser = await getOptionalAuth(c.req.raw);
  const supabase = maybeUser
    ? createAuthClient(maybeUser.accessToken)
    : createPublicClient();

  const data = await getArticleByIdOrSlugModel(supabase, idOrSlug);

  if (!data) {
    return c.json({ error: "Article not found" }, 404);
  }

  return c.json(data);
}

export async function createArticle(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as ArticlePayload;

  if (!payload.title || !payload.content) {
    return c.json({ error: "title and content are required" }, 422);
  }

  const data = await createArticleModel(supabase, admin.id, payload);
  return c.json(data, 201);
}

export async function updateArticle(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as Partial<ArticlePayload>;

  const data = await updateArticleModel(
    supabase,
    c.req.param("idOrSlug"),
    payload,
  );
  if (!data) {
    return c.json({ error: "Article not found" }, 404);
  }

  return c.json(data);
}

export async function deleteArticle(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);

  await deleteArticleModel(supabase, c.req.param("idOrSlug"));
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
  const payload = (await c.req.json()) as {
    filename?: string;
    contentType?: string;
  };

  const settings = await getCloudinarySettingsModel(supabase);
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "articles";

  // Parameters to sign
  const params: Record<string, string | number> = {
    folder,
    timestamp,
  };

  if (settings.CLOUDINARY_UPLOAD_PRESET) {
    params.upload_preset = settings.CLOUDINARY_UPLOAD_PRESET;
  }

  // Generate signature: sort keys, join with &, append secret, then sha1
  const sortedKeys = Object.keys(params).sort();
  const signatureString =
    sortedKeys.map((key) => `${key}=${params[key]}`).join("&") +
    settings.CLOUDINARY_API_SECRET;

  const msgUint8 = new TextEncoder().encode(signatureString);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return c.json({
    signature,
    timestamp,
    apiKey: settings.CLOUDINARY_API_KEY,
    cloudName: settings.CLOUDINARY_CLOUD_NAME,
    folder,
    uploadPreset: settings.CLOUDINARY_UPLOAD_PRESET,
    uploadUrl: `https://api.cloudinary.com/v1_1/${settings.CLOUDINARY_CLOUD_NAME}/image/upload`,
  });
}
