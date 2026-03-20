import type { Hono } from "jsr:@hono/hono";

import {
  adminLogin,
  getDashboard,
  getMe,
  listComments,
  listUsers,
} from "../controllers/admin.controller.ts";
import {
  forgotPassword,
  resetPassword,
  changePassword,
  enroll2FA,
  verify2FA,
  unenroll2FA,
  getAuthenticatorStatus,
} from "../controllers/auth.controller.ts";

export function registerAdminRoutes(app: Hono) {
  app.post("/api/admin/login", adminLogin);
  app.get("/api/admin/me", getMe);
  app.get("/api/admin/dashboard", getDashboard);
  app.get("/api/admin/comments", listComments);
  app.get("/api/admin/users", listUsers);

  // Auth & 2FA Extensions
  app.post("/api/admin/forgot-password", forgotPassword);
  app.post("/api/admin/reset-password", resetPassword);
  app.post("/api/admin/change-password", changePassword);
  
  app.post("/api/admin/2fa/enroll", enroll2FA);
  app.post("/api/admin/2fa/verify", verify2FA);
  app.post("/api/admin/2fa/unenroll", unenroll2FA);
  app.get("/api/admin/2fa/status", getAuthenticatorStatus);
}
