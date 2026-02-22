import { AdminCategoriesManager } from "@/components/blog/admin-categories-manager";
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
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Manage category CRUD on this page only.
        </p>
      </header>
      <AdminCategoriesManager accessToken={accessToken} initialCategories={categories} />
    </section>
  );
}
