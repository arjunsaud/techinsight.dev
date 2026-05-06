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

import { Pagination } from "@/components/ui/pagination";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface AdminArticlesListProps {
  accessToken: string;
  initialArticles: Article[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  filter?: string;
}

export function AdminArticlesList({
  accessToken,
  initialArticles,
  initialTotal,
  initialPage,
  pageSize,
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

  const [prevFilterProp, setPrevFilterProp] = React.useState(filter);
  const [localFilter, setLocalFilter] = React.useState(filter);
  
  const page = parseInt(searchParams.get("page") || initialPage.toString(), 10);

  // Derive state during render 
  if (filter !== prevFilterProp) {
    setPrevFilterProp(filter);
    setLocalFilter(filter);
  }

  const hasInitialData = !searchQuery && localFilter === "all" && initialArticles.length > 0 && page === initialPage;

  const articlesQuery = useQuery({
    queryKey: ["admin-articles", localFilter, searchQuery, page],
    queryFn: () =>
      articleService.listAdmin(
        {
          page,
          pageSize,
          status: localFilter === "all" ? undefined : (localFilter as any),
          query: searchQuery || undefined,
        },
        accessToken,
      ),
    initialData: hasInitialData
      ? {
          data: initialArticles,
          page,
          pageSize,
          total: initialTotal,
        }
      : undefined,
    enabled: Boolean(accessToken),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const allArticles = articlesQuery.data?.data ?? [];
  const currentTotal = articlesQuery.data?.total ?? initialTotal;

  // Debounce search update to URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        params.set("search", searchQuery);
        params.delete("page"); // reset page on search
      } else {
        params.delete("search");
      }

      const newSearch = params.toString();
      const currentSearch = searchParams.toString();

      if (newSearch !== currentSearch) {
        router.replace(`${pathname}?${newSearch}` as any);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, router, pathname, searchParams]);

  const handleFilterChange = (newFilter: string) => {
    setLocalFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }
    params.delete("page"); // reset page on filter change
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
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

  const publishedCount = allArticles.filter((a) => a.status === "published").length;
  const draftCount = allArticles.filter((a) => a.status === "draft").length;
  const scheduledCount = 0;

  const filters = [
    { id: "all", label: "All", count: currentTotal },
    { id: "published", label: "Published", count: publishedCount },
    { id: "draft", label: "Drafts", count: draftCount },
    { id: "scheduled", label: "Scheduled", count: scheduledCount },
  ];

  const [articleToDelete, setArticleToDelete] = React.useState<Article | null>(null);

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
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                localFilter === f.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              {f.label} {localFilter === f.id ? `(${currentTotal})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Article Cards List */}
      <div className="space-y-4">
        {articlesQuery.isFetching ? (
          <div className="rounded-xl border p-8 flex justify-center text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading articles...</span>
            </div>
          </div>
        ) : allArticles.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            No articles found for the selected filter.
          </div>
        ) : (
          <>
            {allArticles.map((article: Article) => (
              <ArticleCard key={article.id} id={article.id} slug={article.slug}>
                <ArticleCard.Image
                  src={article.featuredImageUrl}
                  alt={article.title}
                />
                <ArticleCard.Content
                  title={article.title}
                  excerpt={article.excerpt}
                  status={article.status}
                  tags={article.tags?.map((t: any) => t.name) || []}
                  views={article.viewsCount || 0} 
                  likes={article.likesCount || 0} 
                  comments={article.comments?.[0]?.count || 0}
                  readTime="5m"
                />
                <ArticleCard.Actions
                  onDelete={() => setArticleToDelete(article)}
                />
              </ArticleCard>
            ))}
            <Pagination total={currentTotal} page={page} pageSize={pageSize} />
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!articleToDelete}
        onClose={() => setArticleToDelete(null)}
        onConfirm={() => articleToDelete && deleteArticleMutation.mutate(articleToDelete.id)}
        title="Delete Article"
        description={`Are you sure you want to delete "${articleToDelete?.title}"? This action cannot be undone.`}
        isLoading={deleteArticleMutation.isPending}
      />
    </div>
  );
}
