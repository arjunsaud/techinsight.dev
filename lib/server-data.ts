import type { Article, Category, Comment, Tag } from "@/types/domain";

import { adminService } from "@/services/admin-service";
import { articleService } from "@/services/article-service";
import { commentService } from "@/services/comment-service";

async function getAllPublishedArticles() {
  const pageSize = 50;
  let page = 1;
  let total = 0;
  const all: Article[] = [];

  do {
    const response = await articleService.listPublished({ page, pageSize });
    all.push(...response.data);
    total = response.total;
    if (response.data.length === 0) {
      break;
    }
    page += 1;
  } while (all.length < total);

  return all;
}

export async function getPublishedArticles() {
  try {
    return await getAllPublishedArticles();
  } catch {
    return [] as Article[];
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    return await articleService.getBySlug(slug);
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
    return await adminService.listCategories();
  } catch {
    return [] as Category[];
  }
}

export async function getTags() {
  try {
    return await adminService.listTags();
  } catch {
    return [] as Tag[];
  }
}
