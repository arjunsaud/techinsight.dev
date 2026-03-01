import { AdminHeader } from "@/components/layout/admin.header";
import { AdminCommentsList } from "@/components/comments/admin-comments-list";
import { adminService } from "@/services/admin-service";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const comments = session
    ? await adminService.listComments(session.access_token)
    : [];

  const resolvedParams = searchParams ? await searchParams : {};
  const filter =
    typeof resolvedParams.filter === "string" ? resolvedParams.filter : "all";

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Comments</h1>
        <p className="text-sm text-muted-foreground">
          Moderate and respond to reader comments
        </p>
      </header>
      <AdminCommentsList
        initialComments={comments}
        filter={filter}
        accessToken={session?.access_token || ""}
      />
    </section>
  );
}
