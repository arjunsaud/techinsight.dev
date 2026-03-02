import type { Hono } from "jsr:@hono/hono";

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/category.controller.ts";

export function registerCategoryRoutes(app: Hono) {
  app.get("/api/category", listCategories);
  app.post("/api/category", createCategory);
  app.patch("/api/category/:categoryId", updateCategory);
  app.delete("/api/category/:categoryId", deleteCategory);
}
