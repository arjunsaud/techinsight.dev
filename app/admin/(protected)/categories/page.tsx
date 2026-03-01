import { AdminCategoriesManager } from "@/components/article/admin-categories-manager";
import { AdminHeader } from "@/components/layout/admin.header";
import { requireAdmin } from "@/lib/supabase/guards";
import { adminService } from "@/services/admin-service";

export default async function AdminCategoriesPage() {
  const session = await requireAdmin();
  const accessToken = session.access_token;
  const categories = await adminService.listCategories(accessToken);

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
