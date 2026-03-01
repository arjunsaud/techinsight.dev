import { AdminArticlesList } from "@/components/article/admin-articles-list";
import { requireAdmin } from "@/lib/supabase/guards";
import { createClient } from "@/lib/supabase/server";
import { articleService } from "@/services/article-service";

export default async function AdminAllArticlesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token ?? "";

  const resolvedParams = searchParams ? await searchParams : {};
  const filter =
    typeof resolvedParams.filter === "string" ? resolvedParams.filter : "all";

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
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">All Articles</h1>
        <p className="text-sm text-muted-foreground">
          Manage and delete articles here. Use Edit to open the editor page.
        </p>
      </header>
      <AdminArticlesList
        accessToken={accessToken}
        initialArticles={articlesResponse.data}
        filter={filter}
      />
    </section>
  );
}
