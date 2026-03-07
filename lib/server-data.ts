import type { Article, Category, Comment, Tag } from "@/types/domain";

import { adminService } from "@/services/admin-service";
import { articleService } from "@/services/article-service";
import { commentService } from "@/services/comment-service";
import { CACHE_TTL } from "./constants/common.constants";

async function getAllPublishedArticles(
  filters: { category?: string; tag?: string; featured?: boolean } = {},
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
  filters: { category?: string; tag?: string; featured?: boolean } = {},
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
