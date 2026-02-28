import { AdminBlogStudio } from "@/components/blog/admin-blog-studio";
import { BlogSeoSettings } from "@/components/blog/admin-seo-settings";
import { AdminStudioProvider } from "@/components/blog/admin-studio-context";
import { BlogHeaderControls } from "@/components/blog/admin-header-controls";
import { requireAdmin } from "@/lib/supabase/guards";
import { createClient } from "@/lib/supabase/server";
import { blogService } from "@/services/blog-service";

interface AdminBlogsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminBlogsPage({
  searchParams,
}: AdminBlogsPageProps) {
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
    <AdminStudioProvider>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <header>
            <p className="text-2xl font-bold tracking-tight">Write Articles</p>
            <p className="text-sm text-muted-foreground">
              Write articles here
            </p>
          </header>
          <div className="flex items-center gap-2">
            <BlogHeaderControls />
            <BlogSeoSettings accessToken={accessToken} blogId={editBlogId} />
          </div>
        </div>

        <AdminBlogStudio
          accessToken={accessToken}
          initialBlogs={blogsResponse.data}
          initialEditBlogId={editBlogId}
        />
      </section>
    </AdminStudioProvider>
  );
}
