import type { Hono } from "jsr:@hono/hono";

import {
  createArticle,
  createUploadDraft,
  deleteArticle,
  getArticle,
  getRecommendedArticles,
  listArticles,
  updateArticle,
} from "../controllers/article.controller.ts";

export function registerArticleRoutes(app: Hono) {
  // Supabase framework routing requires function-name prefix.
  app.get("/api/article", listArticles);
  app.get("/api/article/recommended", getRecommendedArticles);
  app.post("/api/article", createArticle);

  app.post("/api/article/upload-url", createUploadDraft);

  app.get("/api/article/:idOrSlug", getArticle);
  app.patch("/api/article/:idOrSlug", updateArticle);
  app.delete("/api/article/:idOrSlug", deleteArticle);
}
