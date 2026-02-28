import type { Hono } from "jsr:@hono/hono";

import {
  createArticle,
  createCategory,
  createTag,
  createUploadDraft,
  deleteCategory,
  deleteArticle,
  deleteTag,
  getArticle,
  listArticles,
  listCategories,
  listTags,
  updateCategory,
  updateArticle,
  updateTag,
} from "../controllers/article.controller.ts";

export function registerArticleRoutes(app: Hono) {
  // Supabase framework routing requires function-name prefix.
  app.get("/api/article", listArticles);
  app.post("/api/article", createArticle);

  app.get("/api/article/categories", listCategories);
  app.post("/api/article/categories", createCategory);
  app.patch("/api/article/categories/:categoryId", updateCategory);
  app.delete("/api/article/categories/:categoryId", deleteCategory);

  app.get("/api/article/tags", listTags);
  app.post("/api/article/tags", createTag);
  app.patch("/api/article/tags/:tagId", updateTag);
  app.delete("/api/article/tags/:tagId", deleteTag);

  app.post("/api/article/upload-url", createUploadDraft);

  app.get("/api/article/:idOrSlug", getArticle);
  app.patch("/api/article/:idOrSlug", updateArticle);
  app.delete("/api/article/:idOrSlug", deleteArticle);
}
