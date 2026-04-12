import { AdminCategoriesManager } from "@/components/article/admin-categories-manager";
import { AdminHeader } from "@/components/layout/admin-header";
import { requireAdmin } from "@/lib/supabase/guards";
import { adminService } from "@/services/admin-service";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdmin();
  const accessToken = session.access_token;

  const resolvedParams = searchParams ? await searchParams : {};
  const page = parseInt(typeof resolvedParams.page === "string" ? resolvedParams.page : "1", 10);
  const pageSize = 12;

  const categoriesResponse = await adminService.listCategories(accessToken, { page, pageSize });

  const categoriesData = Array.isArray(categoriesResponse) 
    ? categoriesResponse 
    : categoriesResponse.data || [];
  
  const total = Array.isArray(categoriesResponse) 
    ? categoriesResponse.length 
    : categoriesResponse.total || 0;

  return (
    <section className="space-y-6">
      <AdminHeader title="Categories" description="Manage categories" />
      <AdminCategoriesManager
        accessToken={accessToken}
        initialCategories={categoriesData}
        page={page}
        pageSize={pageSize}
        total={total}
      />
    </section>
  );
}
