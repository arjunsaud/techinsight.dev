import { AdminHeader } from "@/components/layout/admin-header";
import { AdminCommentsList } from "@/components/comments/admin-comments-list";
import { adminService } from "@/services/admin-service";
import { requireAdmin } from "@/lib/supabase/guards";

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdmin();
  const resolvedParams = searchParams ? await searchParams : {};
  const filter =
    typeof resolvedParams.filter === "string" ? resolvedParams.filter : "all";
    
  const page = parseInt(typeof resolvedParams.page === "string" ? resolvedParams.page : "1", 10);
  const pageSize = 10;
  
  const comments = await adminService.listComments(session.access_token, page, pageSize);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Comments</h1>
        <p className="text-sm text-muted-foreground">
          Moderate and respond to reader comments
        </p>
      </header>
      <AdminCommentsList
        initialComments={Array.isArray(comments) ? comments : comments.data || []}
        filter={filter}
        accessToken={session?.access_token || ""}
        page={comments.page || 1}
        pageSize={comments.pageSize || 10}
        total={comments.total || (Array.isArray(comments) ? comments.length : 0)}
      />
    </section>
  );
}
