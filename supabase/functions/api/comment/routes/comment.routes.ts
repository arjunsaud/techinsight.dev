import type { Hono } from "jsr:@hono/hono";

import {
  createComment,
  deleteComment,
  listByArticle,
} from "../controllers/comment.controller.ts";

export function registerCommentRoutes(app: Hono) {
  app.get("/api/comment", listByArticle);
  app.post("/api/comment", createComment);
  app.delete("/api/comment/:commentId", deleteComment);
}
