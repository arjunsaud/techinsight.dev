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

async function getAllPublishedArticles(
  filters: { category?: string; tag?: string; isFeatured?: boolean } = {},
) {
  const pageSize = 50;
  let page = 1;
  let total = 0;
  const all: Article[] = [];

  do {
    const response = await articleService.listPublished(
      { page, pageSize, ...filters },
      { next: { revalidate: CACHE_TTL, tags: ["articles"] } },
    );
    all.push(...response.data);
    total = response.total;
    if (response.data.length === 0) {
      break;
    }
    page += 1;
  } while (all.length < total);

  return all;
}

export async function getPublishedArticles(
  filters: { category?: string; tag?: string; isFeatured?: boolean } = {},
) {
  try {
    return await getAllPublishedArticles(filters);
  } catch {
    return [] as Article[];
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
    return await adminService.listCategories(undefined, {
      next: { revalidate: CACHE_TTL, tags: ["categories"] },
    });
  } catch {
    return [] as Category[];
  }
}

export async function getTags() {
  try {
    return await adminService.listTags(undefined, {
      next: { revalidate: CACHE_TTL, tags: ["tags"] },
    });
  } catch {
    return [] as Tag[];
  }
}

export async function getSeries() {
  try {
    return await seriesService.list({
      next: { revalidate: CACHE_TTL, tags: ["series"] },
    });
  } catch {
    return [] as Series[];
  }
}

export async function getSeriesBySlug(slug: string, withPosts = false) {
  try {
    return await seriesService.getBySlug(slug, withPosts, {
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
