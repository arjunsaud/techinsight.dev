import { AdminTagsManager } from "@/components/blog/admin-tags-manager";
import { requireAdmin } from "@/lib/supabase/guards";
import { createClient } from "@/lib/supabase/server";
import { adminService } from "@/services/admin-service";

export default async function AdminTagsPage() {
  await requireAdmin();

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token ?? "";
  const tags = accessToken
    ? await adminService.listTags(accessToken)
    : [];

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
        <p className="text-sm text-muted-foreground">
          Manage tag CRUD on this page only.
        </p>
      </header>
      <AdminTagsManager accessToken={accessToken} initialTags={tags} />
    </section>
  );
}
