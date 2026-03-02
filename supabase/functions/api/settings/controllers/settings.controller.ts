import type { Context } from "jsr:@hono/hono";

import { requireAdmin } from "../../../shared/auth.ts";
import { createAuthClient } from "../../../shared/client.ts";
import {
  getCloudinarySettingsModel,
  upsertCloudinarySettingsModel,
} from "../models/settings.model.ts";
import type { CloudinarySettings } from "../models/settings.model.ts";

export async function getCloudinarySettings(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);

  const data = await getCloudinarySettingsModel(supabase);
  // Never expose the API secret in plain text; mask it for safety
  return c.json({
    ...data,
    CLOUDINARY_API_SECRET: data.CLOUDINARY_API_SECRET ? "••••••••" : "",
  });
}

export async function updateCloudinarySettings(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as Partial<CloudinarySettings>;

  await upsertCloudinarySettingsModel(supabase, payload);
  return c.json({ success: true });
}
