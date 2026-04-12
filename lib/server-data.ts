import type {
  Article,
  Category,
  Comment,
  Tag,
  Series,
  PostSeriesInfo,
} from "@/types/domain";

import { adminService } from "@/services/admin-service";
import { articleService } from "@/services/article-service";
import { commentService } from "@/services/comment-service";
import { seriesService } from "@/services/series-service";
import { CACHE_TTL } from "./constants/common.constants";

export async function getPublishedArticles(
  filters: { category?: string; tag?: string; isFeatured?: boolean; page?: number; pageSize?: number } = {},
) {
  try {
    const { page = 1, pageSize = 12, ...restFilters } = filters;
    const response = await articleService.listPublished(
      { page, pageSize, ...restFilters },
      { next: { revalidate: CACHE_TTL, tags: ["articles"] } },
    );
    // If backend isn't paginated yet, wrap the array response 
    if (Array.isArray(response)) {
      return { data: response, page: 1, pageSize: Math.max(12, response.length), total: response.length };
    }
    if (!response || !response.data) {
      return { data: [] as Article[], page: 1, pageSize: 12, total: 0 };
    }
    return response;
  } catch {
    return { data: [] as Article[], page: 1, pageSize: 12, total: 0 };
  }
}

export async function getRecommendedArticles() {
  try {
    return await articleService.getRecommended({
      next: { revalidate: CACHE_TTL, tags: ["articles", "recommended"] },
    });
  } catch {
    return [] as Article[];
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    return await articleService.getBySlug(slug, {
      next: { revalidate: CACHE_TTL, tags: [`article-${slug}`] },
    });
  } catch {
    return null;
  }
}

export async function getCommentsByArticle(articleId: string) {
  try {
    return await commentService.listByArticle(articleId);
  } catch {
    return [] as Comment[];
  }
}

export async function getCategories() {
  try {
    const response = await adminService.listCategories(undefined, {
      next: { revalidate: CACHE_TTL, tags: ["categories"] },
    });
    return Array.isArray(response) ? response : response.data || [];
  } catch {
    return [] as Category[];
  }
}

export async function getTags() {
  try {
    const response = await adminService.listTags(undefined, {
      next: { revalidate: CACHE_TTL, tags: ["tags"] },
    });
    return Array.isArray(response) ? response : response.data || [];
  } catch {
    return [] as Tag[];
  }
}

export async function getSeries(options: { page?: number; pageSize?: number } = {}) {
  try {
    const response = await seriesService.list({
      ...options,
      next: { revalidate: CACHE_TTL, tags: ["series"] },
    });
    // Fallback for array response
    if (Array.isArray(response)) {
      return { data: response, page: 1, pageSize: Math.max(12, response.length), total: response.length };
    }
    if (!response || !response.data) {
      return { data: [] as Series[], page: 1, pageSize: 12, total: 0 };
    }
    return response;
  } catch {
    return { data: [] as Series[], page: 1, pageSize: 12, total: 0 };
  }
}

export async function getSeriesBySlug(
  slug: string,
  withPosts = false,
  options: {
    page?: number;
    pageSize?: number;
    next?: NextFetchRequestConfig;
    cache?: RequestCache;
  } = {},
) {
  try {
    const { page, pageSize, ...fetchOptions } = options;
    return await seriesService.getBySlug(slug, withPosts, {
      ...fetchOptions,
      page,
      pageSize,
      next: { revalidate: CACHE_TTL, tags: [`series-${slug}`] },
    });
  } catch {
    return null;
  }
}

export async function getSeriesPostBySlug(slug: string) {
  try {
    return await seriesService.getPostBySlug(slug);
  } catch {
    return null;
  }
}

export async function getPostSeriesInfo(postSlug: string) {
  try {
    return await seriesService.getPostSeriesInfo(postSlug, {
      next: { revalidate: CACHE_TTL, tags: [`post-series-${postSlug}`] },
    });
  } catch {
    return null;
  }
}
