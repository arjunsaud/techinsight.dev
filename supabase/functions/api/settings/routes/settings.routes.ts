import type { Hono } from "jsr:@hono/hono";

import {
  getCloudinarySettings,
  updateCloudinarySettings,
} from "../controllers/settings.controller.ts";

export function registerSettingsRoutes(app: Hono) {
  app.get("/api/settings/cloudinary", getCloudinarySettings);
  app.patch("/api/settings/cloudinary", updateCloudinarySettings);
}
