import type { Hono } from "jsr:@hono/hono";

import {
  createTag,
  deleteTag,
  listTags,
  updateTag,
} from "../controllers/tag.controller.ts";

export function registerTagRoutes(app: Hono) {
  app.get("/api/tag", listTags);
  app.post("/api/tag", createTag);
  app.patch("/api/tag/:tagId", updateTag);
  app.delete("/api/tag/:tagId", deleteTag);
}
