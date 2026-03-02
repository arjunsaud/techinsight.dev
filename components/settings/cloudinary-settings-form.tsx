"use client";

import { useState, useTransition } from "react";
import {
  Cloud,
  Key,
  Lock,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  settingsService,
  type CloudinarySettings,
} from "@/services/settings-service";

interface Props {
  initialSettings: CloudinarySettings;
  accessToken: string;
}

export function CloudinarySettingsForm({
  initialSettings,
  accessToken,
}: Props) {
  const [form, setForm] = useState({
    CLOUDINARY_CLOUD_NAME: initialSettings.CLOUDINARY_CLOUD_NAME ?? "",
    CLOUDINARY_API_KEY: initialSettings.CLOUDINARY_API_KEY ?? "",
    CLOUDINARY_API_SECRET: "",
    CLOUDINARY_UPLOAD_PRESET: initialSettings.CLOUDINARY_UPLOAD_PRESET ?? "",
  });
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>(
    {},
  );
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus("idle");
  }

  const toggleVisibility = (key: string) => {
    setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");

    const payload: Partial<CloudinarySettings> = {
      CLOUDINARY_CLOUD_NAME: form.CLOUDINARY_CLOUD_NAME.trim(),
      CLOUDINARY_API_KEY: form.CLOUDINARY_API_KEY.trim(),
      CLOUDINARY_UPLOAD_PRESET:
        form.CLOUDINARY_UPLOAD_PRESET.trim() || undefined,
    };
    // Only send secret if user typed a new one
    if (form.CLOUDINARY_API_SECRET.trim()) {
      payload.CLOUDINARY_API_SECRET = form.CLOUDINARY_API_SECRET.trim();
    }

    startTransition(async () => {
      try {
        await settingsService.updateCloudinary(payload, accessToken);
        setStatus("success");
        // Clear secret field after save
        setForm((prev) => ({ ...prev, CLOUDINARY_API_SECRET: "" }));
      } catch (err) {
        setStatus("error");
        setErrorMsg(
          err instanceof Error ? err.message : "Failed to save settings",
        );
      }
    });
  }

  const fields = [
    {
      key: "CLOUDINARY_CLOUD_NAME" as const,
      label: "Cloud Name",
      icon: Cloud,
      placeholder: "my-cloud",
      hint: "Found in your Cloudinary dashboard",
    },
    {
      key: "CLOUDINARY_API_KEY" as const,
      label: "API Key",
      icon: Key,
      placeholder: "123456789012345",
      hint: "From Settings → API Keys",
    },
    {
      key: "CLOUDINARY_API_SECRET" as const,
      label: "API Secret",
      icon: Lock,
      placeholder: initialSettings.CLOUDINARY_API_SECRET
        ? "Leave blank to keep existing secret"
        : "Enter API secret",
      hint: "Leave blank to keep the current secret",
    },
    {
      key: "CLOUDINARY_UPLOAD_PRESET" as const,
      label: "Upload Preset",
      icon: Upload,
      placeholder: "my_preset (optional)",
      hint: "Optional signed upload preset name (must be 'Signed' type in Cloudinary)",
    },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5">
        {fields.map(({ key, label, icon: Icon, placeholder, hint }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Icon className="h-4 w-4 text-gray-400" />
              {label}
            </label>
            <div className="relative">
              <input
                name={key}
                type={visibleFields[key] ? "text" : "password"}
                value={form[key]}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off"
                className="w-full rounded-lg border border-gray-200 bg-white pl-3.5 pr-10 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
              />
              <button
                type="button"
                onClick={() => toggleVisibility(key)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {visibleFields[key] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">{hint}</p>
          </div>
        ))}
      </div>

      {status === "success" && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Settings saved successfully.
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 transition"
      >
        <Save className="h-4 w-4" />
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
