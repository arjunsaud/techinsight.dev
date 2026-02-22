import type { Hono } from "jsr:@hono/hono";

import {
  createBlog,
  createCategory,
  createTag,
  createUploadDraft,
  deleteCategory,
  deleteBlog,
  deleteTag,
  getBlog,
  listBlogs,
  listCategories,
  listTags,
  updateCategory,
  updateBlog,
  updateTag,
} from "../controllers/blog.controller.ts";

export function registerBlogRoutes(app: Hono) {
  // Supabase framework routing requires function-name prefix.
  app.get("/api/blog", listBlogs);
  app.post("/api/blog", createBlog);

  app.get("/api/blog/categories", listCategories);
  app.post("/api/blog/categories", createCategory);
  app.patch("/api/blog/categories/:categoryId", updateCategory);
  app.delete("/api/blog/categories/:categoryId", deleteCategory);

  app.get("/api/blog/tags", listTags);
  app.post("/api/blog/tags", createTag);
  app.patch("/api/blog/tags/:tagId", updateTag);
  app.delete("/api/blog/tags/:tagId", deleteTag);

  app.post("/api/blog/upload-url", createUploadDraft);

  app.get("/api/blog/:idOrSlug", getBlog);
  app.patch("/api/blog/:idOrSlug", updateBlog);
  app.delete("/api/blog/:idOrSlug", deleteBlog);
}
