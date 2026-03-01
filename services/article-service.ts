import type { Article } from "@/types/domain";
import type {
  ArticleFilterInput,
  CreateArticleInput,
  PaginatedResponse,
  UpdateArticleInput,
} from "@/types/api";

import { apiFetch } from "@/services/http";

export const articleService = {
  listPublished(
    filters: ArticleFilterInput = {},
    options: { next?: NextFetchRequestConfig; cache?: RequestCache } = {},
  ) {
    const query = {
      query: filters.query,
      category: filters.category,
      tag: filters.tag,
      page: filters.page,
      pageSize: filters.pageSize,
      status: "published" as const,
    };

    return apiFetch<PaginatedResponse<Article>>("article", {
      query,
      ...options,
    });
  },

  listAdmin(filters: ArticleFilterInput = {}, accessToken?: string) {
    const query = {
      query: filters.query,
      category: filters.category,
      tag: filters.tag,
      page: filters.page,
      pageSize: filters.pageSize,
      status: filters.status,
    };

    return apiFetch<PaginatedResponse<Article>>("article", {
      query,
      accessToken,
    });
  },

  getBySlug(
    slug: string,
    options: { next?: NextFetchRequestConfig; cache?: RequestCache } = {},
  ) {
    return apiFetch<Article>(`article/${slug}`, options);
  },

  create(input: CreateArticleInput, accessToken: string) {
    return apiFetch<Article>("article", {
      method: "POST",
      body: input,
      accessToken,
    });
  },

  update(input: UpdateArticleInput, accessToken: string) {
    return apiFetch<Article>(`article/${input.id}`, {
      method: "PATCH",
      body: input,
      accessToken,
    });
  },

  remove(articleId: string, accessToken: string) {
    return apiFetch<void>(`article/${articleId}`, {
      method: "DELETE",
      accessToken,
    });
  },

  getUploadDraft(filename: string, accessToken: string) {
    return apiFetch<{
      signature: string;
      timestamp: number;
      apiKey: string;
      cloudName: string;
      folder: string;
      uploadPreset?: string;
      uploadUrl: string;
    }>("article/upload-url", {
      method: "POST",
      body: { filename },
      accessToken,
    });
  },
};
