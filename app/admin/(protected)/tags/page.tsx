import { AdminTagsManager } from "@/components/article/admin-tags-manager";
import { AdminHeader } from "@/components/layout/admin-header";
import { requireAdmin } from "@/lib/supabase/guards";
import { adminService } from "@/services/admin-service";

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdmin();
  const accessToken = session.access_token;

  const resolvedParams = searchParams ? await searchParams : {};
  const page = parseInt(typeof resolvedParams.page === "string" ? resolvedParams.page : "1", 10);
  const pageSize = 24; // tags are smaller, can show more

  const tagsResponse = await adminService.listTags(accessToken, { page, pageSize });
  
  const tagsData = Array.isArray(tagsResponse) 
    ? tagsResponse 
    : tagsResponse.data || [];
    
  const total = Array.isArray(tagsResponse) 
    ? tagsResponse.length 
    : tagsResponse.total || 0;

  return (
    <section className="space-y-6">
      <AdminHeader title="Tags" description="Manage tags" />
      <AdminTagsManager 
        accessToken={accessToken} 
        initialTags={tagsData} 
        page={page}
        pageSize={pageSize}
        total={total}
      />
    </section>
  );
}
