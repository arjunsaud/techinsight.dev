import { AdminCategoriesManager } from "@/components/article/admin-categories-manager";
import { AdminHeader } from "@/components/layout/admin.header";
import { requireAdmin } from "@/lib/supabase/guards";
import { createClient } from "@/lib/supabase/server";
import { adminService } from "@/services/admin-service";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token ?? "";
  const categories = accessToken
    ? await adminService.listCategories(accessToken)
    : [];

  return (
    <section className="space-y-6">
      <AdminHeader title="Categories" description="Manage categories" />
      <AdminCategoriesManager
        accessToken={accessToken}
        initialCategories={categories}
      />
    </section>
  );
}
