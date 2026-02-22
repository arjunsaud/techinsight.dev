import type { Hono } from "jsr:@hono/hono";

import {
  adminLogin,
  getDashboard,
  getMe,
  listComments,
  listUsers,
} from "../controllers/admin.controller.ts";

export function registerAdminRoutes(app: Hono) {
  app.post("/api/admin/login", adminLogin);
  app.get("/api/admin/me", getMe);
  app.get("/api/admin/dashboard", getDashboard);
  app.get("/api/admin/comments", listComments);
  app.get("/api/admin/users", listUsers);
}
