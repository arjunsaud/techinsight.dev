import { AdminArticlesList } from "@/components/article/admin-articles-list";
import { AdminHeader } from "@/components/layout/admin-header";
import { requireAdmin } from "@/lib/supabase/guards";
import { articleService } from "@/services/article-service";

export default async function AdminAllArticlesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdmin();
  const accessToken = session.access_token;

  const resolvedParams = searchParams ? await searchParams : {};
  const filter =
    typeof resolvedParams.filter === "string" ? resolvedParams.filter : "all";
  
  const page = parseInt(typeof resolvedParams.page === "string" ? resolvedParams.page : "1", 10);
  const pageSize = 10;

  const articlesResponse = accessToken
    ? await articleService.listAdmin(
        {
          page,
          pageSize,
          status: filter === "all" ? undefined : (filter as import("@/types/domain").ArticleStatus),
        },
        accessToken,
      )
    : { data: [], page: 1, pageSize: 10, total: 0 };

  return (
    <section className="space-y-6">
      <AdminHeader
        title="All Articles"
        description="Manage and delete articles here. Use Edit to open the editor page."
      />
      <AdminArticlesList
        accessToken={accessToken}
        initialArticles={articlesResponse.data}
        initialTotal={articlesResponse.total}
        initialPage={articlesResponse.page}
        pageSize={pageSize}
        filter={filter}
      />
    </section>
  );
}
