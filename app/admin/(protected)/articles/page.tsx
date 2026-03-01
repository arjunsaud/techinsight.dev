import { AdminArticleStudio } from "@/components/article/admin-article-studio";
import { ArticleSeoSettings } from "@/components/article/admin-seo-settings";
import { AdminStudioProvider } from "@/components/article/admin-studio-context";
import { ArticleHeaderControls } from "@/components/article/admin-header-controls";
import { requireAdmin } from "@/lib/supabase/guards";
import { articleService } from "@/services/article-service";
import { AdminHeader } from "@/components/layout/admin.header";

interface AdminArticlesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminArticlesPage({
  searchParams,
}: AdminArticlesPageProps) {
  const session = await requireAdmin();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const editParam = resolvedSearchParams?.edit;
  const editArticleId = typeof editParam === "string" ? editParam : null;

  const accessToken = session.access_token;

  const articlesResponse = accessToken
    ? await articleService.listAdmin(
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
          <AdminHeader
            title="Write Articles"
            description="Write articles here"
          />
          <div className="flex items-center gap-2">
            <ArticleHeaderControls />
            <ArticleSeoSettings
              accessToken={accessToken}
              articleId={editArticleId}
            />
          </div>
        </div>
        <AdminArticleStudio
          accessToken={accessToken}
          initialArticles={articlesResponse.data}
          initialEditArticleId={editArticleId}
        />
      </section>
    </AdminStudioProvider>
  );
}
