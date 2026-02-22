"use client";

import { useQuery } from "@tanstack/react-query";

import type { BlogFilterInput } from "@/types/api";
import { blogService } from "@/services/blog-service";

export function useBlogs(filters: BlogFilterInput) {
  return useQuery({
    queryKey: ["blogs", filters],
    queryFn: () => blogService.listPublished(filters)
  });
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: ["blog", slug],
    queryFn: () => blogService.getBySlug(slug),
    enabled: Boolean(slug)
  });
}
