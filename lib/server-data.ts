import type { Blog, Category, Comment, Tag } from "@/types/domain";

import { adminService } from "@/services/admin-service";
import { blogService } from "@/services/blog-service";
import { commentService } from "@/services/comment-service";

async function getAllPublishedBlogs() {
  const pageSize = 50;
  let page = 1;
  let total = 0;
  const all: Blog[] = [];

  do {
    const response = await blogService.listPublished({ page, pageSize });
    all.push(...response.data);
    total = response.total;
    if (response.data.length === 0) {
      break;
    }
    page += 1;
  } while (all.length < total);

  return all;
}

export async function getPublishedBlogs() {
  try {
    return await getAllPublishedBlogs();
  } catch {
    return [] as Blog[];
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    return await blogService.getBySlug(slug);
  } catch {
    return null;
  }
}

export async function getCommentsByBlog(blogId: string) {
  try {
    return await commentService.listByBlog(blogId);
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
