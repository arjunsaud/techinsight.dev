import { AdminBlogStudio } from "@/components/blog/admin-blog-studio";
import { requireAdmin } from "@/lib/supabase/guards";
import { createClient } from "@/lib/supabase/server";
import { blogService } from "@/services/blog-service";

interface AdminBlogsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminBlogsPage({ searchParams }: AdminBlogsPageProps) {
  await requireAdmin();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const editParam = resolvedSearchParams?.edit;
  const editBlogId = typeof editParam === "string" ? editParam : null;

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
        <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage blogs with a single editor.
        </p>
      </header>
      <AdminBlogStudio
        accessToken={accessToken}
        initialBlogs={blogsResponse.data}
        initialEditBlogId={editBlogId}
      />
    </section>
  );
}
