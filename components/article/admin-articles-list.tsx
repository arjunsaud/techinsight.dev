"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Article } from "@/types/domain";
import { articleService } from "@/services/article-service";
import { ArticleCard } from "@/components/article/admin-article-card";
import { cn } from "@/lib/utils";

interface AdminArticlesListProps {
  accessToken: string;
  initialArticles: Article[];
  filter?: string;
}

export function AdminArticlesList({
  accessToken,
  initialArticles,
  filter = "all",
}: AdminArticlesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const articlesQuery = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () =>
      articleService.listAdmin(
        {
          page: 1,
          pageSize: 100,
        },
        accessToken,
      ),
    initialData: {
      data: initialArticles,
      page: 1,
      pageSize: 100,
      total: initialArticles.length,
    },
    enabled: Boolean(accessToken),
  });

  const allArticles = articlesQuery.data?.data ?? [];

  const handleFilterChange = (newFilter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}` as any);
    });
  };

  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: string) => {
      if (!accessToken) throw new Error("Missing admin session token.");
      return articleService.remove(articleId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete article",
      );
    },
  });

  // Derived counts for tabs
  const publishedCount = allArticles.filter(
    (a) => a.status === "published",
  ).length;
  const draftCount = allArticles.filter((a) => a.status === "draft").length;
  // Assume scheduled mapping doesn't exist yet, so we just calculate 0
  const scheduledCount = 0;

  const filteredArticles = allArticles.filter((article) => {
    if (filter === "all") return true;
    return article.status === filter;
  });

  const filters = [
    { id: "all", label: "All", count: allArticles.length },
    { id: "published", label: "Published", count: publishedCount },
    { id: "draft", label: "Drafts", count: draftCount },
    { id: "scheduled", label: "Scheduled", count: scheduledCount },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters Strip */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search articles..."
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex items-center rounded-md bg-muted/50 p-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-sm transition-colors",
                filter === f.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Article Cards List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            No articles found for the selected filter.
          </div>
        ) : (
          filteredArticles.map((article) => (
            <ArticleCard key={article.id} id={article.id} slug={article.slug}>
              <ArticleCard.Image
                src={article.featured_image_url}
                alt={article.title}
              />
              <ArticleCard.Content
                title={article.title}
                excerpt={article.excerpt}
                status={article.status}
                tags={article.tags?.map((t) => t.name) || []}
                views={article.id.length * 42} // Placeholder for real stats
                likes={article.id.length * 3} // Placeholder code
                comments={0}
                readTime="5m"
              />
              <ArticleCard.Actions
                onDelete={() => {
                  const ok = globalThis.confirm("Delete this article?");
                  if (!ok) return;
                  deleteArticleMutation.mutate(article.id);
                }}
              />
            </ArticleCard>
          ))
        )}
      </div>
    </div>
  );
}
