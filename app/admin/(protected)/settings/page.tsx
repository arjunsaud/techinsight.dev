import { AdminHeader } from "@/components/layout/admin.header";
import { CloudinarySettingsForm } from "@/components/settings/cloudinary-settings-form";
import { requireAdmin } from "@/lib/supabase/guards";
import { settingsService } from "@/services/settings-service";

export default async function AdminSettingsPage() {
  const session = await requireAdmin();
  const accessToken = session.access_token;
  const settings = await settingsService.getCloudinary(accessToken);

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Settings"
        description="Manage your application credentials and integrations"
      />

      <div className="rounded-xl border lg:w-1/2 sm:w-full border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Cloudinary Integration
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Configure your Cloudinary account credentials for image uploads.
            These are stored securely in your database.
          </p>
        </div>
        <div className="px-6 py-5">
          <CloudinarySettingsForm
            initialSettings={settings}
            accessToken={accessToken}
          />
        </div>
      </div>
    </section>
  );
}
