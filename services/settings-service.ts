import { apiFetch } from "@/services/http";

export interface CloudinarySettings {
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
}

export const settingsService = {
  getCloudinary(accessToken: string) {
    return apiFetch<CloudinarySettings>("settings/cloudinary", { accessToken });
  },

  updateCloudinary(payload: Partial<CloudinarySettings>, accessToken: string) {
    return apiFetch<{ success: boolean }>("settings/cloudinary", {
      method: "PATCH",
      accessToken,
      body: payload,
    });
  },
};
