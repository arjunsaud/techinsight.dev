"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";

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

  const [searchQuery, setSearchQuery] = React.useState(
    searchParams.get("search") || "",
  );

  const articlesQuery = useQuery({
    queryKey: ["admin-articles", filter, searchQuery],
    queryFn: () =>
      articleService.listAdmin(
        {
          page: 1,
          pageSize: 100,
          status: filter === "all" ? undefined : (filter as any),
          query: searchQuery || undefined,
        },
        accessToken,
      ),
    initialData: searchQuery
      ? undefined
      : {
          data: initialArticles,
          page: 1,
          pageSize: 100,
          total: initialArticles.length,
        },
    enabled: Boolean(accessToken),
  });

  const allArticles = articlesQuery.data?.data ?? [];

  // Debounce search update to URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        params.set("search", searchQuery);
      } else {
        params.delete("search");
      }
      router.replace(`${pathname}?${params.toString()}` as any);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, router, pathname, searchParams]);

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

  // Derived counts for tabs - we keep these based on the full initial fetch if possible
  // or just use the current query's total if we want to be accurate to the search.
  // For now, let's keep it simple.
  const publishedCount = allArticles.filter(
    (a) => a.status === "published",
  ).length;
  const draftCount = allArticles.filter((a) => a.status === "draft").length;
  const scheduledCount = 0;

  const filters = [
    { id: "all", label: "All", count: articlesQuery.data?.total ?? 0 },
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
        {allArticles.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            No articles found for the selected filter.
          </div>
        ) : (
          allArticles.map((article: Article) => (
            <ArticleCard key={article.id} id={article.id} slug={article.slug}>
              <ArticleCard.Image
                src={article.featured_image_url}
                alt={article.title}
              />
              <ArticleCard.Content
                title={article.title}
                excerpt={article.excerpt}
                status={article.status}
                tags={article.tags?.map((t: any) => t.name) || []}
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
