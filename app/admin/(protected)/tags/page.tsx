import { AdminTagsManager } from "@/components/article/admin-tags-manager";
import { AdminHeader } from "@/components/layout/admin.header";
import { requireAdmin } from "@/lib/supabase/guards";
import { adminService } from "@/services/admin-service";

export default async function AdminTagsPage() {
  const session = await requireAdmin();
  const accessToken = session.access_token;
  const tags = await adminService.listTags(accessToken);

  return (
    <section className="space-y-6">
      <AdminHeader title="Tags" description="Manage tags" />
      <AdminTagsManager accessToken={accessToken} initialTags={tags} />
    </section>
  );
}
