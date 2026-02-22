import type { Context } from "jsr:@hono/hono";

import { requireAdmin, requireAuth } from "../../../shared/auth.ts";
import { createAuthClient, createPublicClient } from "../../../shared/client.ts";
import {
  createCommentModel,
  deleteCommentModel,
  listCommentsByBlogModel,
} from "../models/comment.model.ts";

export async function listByBlog(c: Context) {
  const blogId = c.req.query("blogId");

  if (!blogId) {
    return c.json({ error: "blogId is required" }, 422);
  }

  const supabase = createPublicClient();
  const data = await listCommentsByBlogModel(supabase, blogId);

  return c.json(data);
}

export async function createComment(c: Context) {
  const user = await requireAuth(c.req.raw);
  const supabase = createAuthClient(user.accessToken);
  const payload = (await c.req.json()) as {
    blogId?: string;
    content?: string;
    parentId?: string;
  };

  if (!payload.blogId || !payload.content) {
    return c.json({ error: "blogId and content are required" }, 422);
  }

  const data = await createCommentModel(supabase, {
    blogId: payload.blogId,
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
