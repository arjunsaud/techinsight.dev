import type { Context } from "jsr:@hono/hono";

import { requireAdmin, requireAuth } from "../../../shared/auth.ts";
import { createAuthClient, createPublicClient } from "../../../shared/client.ts";
import {
  createCommentModel,
  deleteCommentModel,
  listCommentsByArticleModel,
} from "../models/comment.model.ts";

export async function listByArticle(c: Context) {
  const articleId = c.req.query("articleId");

  if (!articleId) {
    return c.json({ error: "articleId is required" }, 422);
  }

  const supabase = createPublicClient();
  const data = await listCommentsByArticleModel(supabase, articleId);

  return c.json(data);
}

export async function createComment(c: Context) {
  const user = await requireAuth(c.req.raw);
  const supabase = createAuthClient(user.accessToken);
  const payload = (await c.req.json()) as {
    articleId?: string;
    content?: string;
    parentId?: string;
  };

  if (!payload.articleId || !payload.content) {
    return c.json({ error: "articleId and content are required" }, 422);
  }

  const data = await createCommentModel(supabase, {
    articleId: payload.articleId,
    userId: user.id,
    content: payload.content,
    parentId: payload.parentId,
  });

  return c.json(data, 201);
}

export async function deleteComment(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);

  await deleteCommentModel(supabase, c.req.param("commentId"));
  return c.body(null, 204);
}
