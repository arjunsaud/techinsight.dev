import { AdminBlogsList } from "@/components/blog/admin-blogs-list";
import { requireAdmin } from "@/lib/supabase/guards";
import { createClient } from "@/lib/supabase/server";
import { blogService } from "@/services/blog-service";

export default async function AdminAllBlogsPage() {
  await requireAdmin();

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token ?? "";

  const blogsResponse = accessToken
    ? await blogService.listAdmin(
      {
        page: 1,
        pageSize: 100,
      },
      accessToken,
    )
    : { data: [], page: 1, pageSize: 100, total: 0 };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">All Blogs</h1>
        <p className="text-sm text-muted-foreground">
          Manage and delete blogs here. Use Edit to open the editor page.
        </p>
      </header>
      <AdminBlogsList accessToken={accessToken} initialBlogs={blogsResponse.data} />
    </section>
  );
}
