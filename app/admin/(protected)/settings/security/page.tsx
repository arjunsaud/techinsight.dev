import { AdminHeader } from "@/components/layout/admin.header";
import { SecuritySettings } from "@/components/settings/security-settings";
import { requireAdmin } from "@/lib/supabase/guards";

export default async function SecuritySettingsPage() {
  const session = await requireAdmin();

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Security Settings"
        description="Manage your password and two-factor authentication"
      />

      <div className="lg:w-3/4 sm:w-full">
        <SecuritySettings accessToken={session.access_token} />
      </div>
    </section>
  );
}
