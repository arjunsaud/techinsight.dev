import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export interface CloudinarySettings {
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
}

const CLOUDINARY_SETTING_KEYS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_UPLOAD_PRESET",
] as const;

export async function getCloudinarySettingsModel(
  supabase: SupabaseClient,
): Promise<CloudinarySettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key,value")
    .in("key", [...CLOUDINARY_SETTING_KEYS]);

  if (error) {
    throw new Error(error.message);
  }

  const settings = Object.fromEntries(
    (data ?? []).map((row: { key: string; value: string }) => [
      row.key,
      row.value,
    ]),
  ) as Partial<CloudinarySettings>;

  return settings as CloudinarySettings;
}

export async function upsertCloudinarySettingsModel(
  supabase: SupabaseClient,
  payload: Partial<CloudinarySettings>,
) {
  const rows = Object.entries(payload)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([key, value]) => ({ key, value: value as string }));

  if (rows.length === 0) return;

  const { error } = await supabase
    .from("app_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) {
    throw new Error(error.message);
  }
}
