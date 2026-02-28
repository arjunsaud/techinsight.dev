"use client";

import { useQuery } from "@tanstack/react-query";

import type { ArticleFilterInput } from "@/types/api";
import { articleService } from "@/services/article-service";

export function useArticles(filters: ArticleFilterInput) {
  return useQuery({
    queryKey: ["articles", filters],
    queryFn: () => articleService.listPublished(filters)
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () => articleService.getBySlug(slug),
    enabled: Boolean(slug)
  });
}
