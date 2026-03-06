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
    const queryParams: Record<string, string | number | boolean> = {
      page: filters.page || 1,
      pageSize: filters.pageSize || 10,
      status: "published",
    };

    if (filters.query) queryParams.query = filters.query;
    if (filters.category) queryParams.category = filters.category;
    if (filters.tag) queryParams.tag = filters.tag;
    if (filters.isFeatured !== undefined && filters.isFeatured !== null) {
      queryParams.featured = filters.isFeatured;
    }

    return apiFetch<PaginatedResponse<Article>>("article", {
      query: queryParams,
      ...options,
    });
  },

  listAdmin(filters: ArticleFilterInput = {}, accessToken?: string) {
    const queryParams: Record<string, string | number | boolean> = {
      page: filters.page || 1,
      pageSize: filters.pageSize || 10,
    };

    if (filters.query) queryParams.query = filters.query;
    if (filters.category) queryParams.category = filters.category;
    if (filters.tag) queryParams.tag = filters.tag;
    if (filters.isFeatured !== undefined && filters.isFeatured !== null) {
      queryParams.featured = filters.isFeatured;
    }
    if (filters.status) queryParams.status = filters.status;

    return apiFetch<PaginatedResponse<Article>>("article", {
      query: queryParams,
      accessToken,
    });
  },

  getRecommended(
    options: { next?: NextFetchRequestConfig; cache?: RequestCache } = {},
  ) {
    return apiFetch<Article[]>("article/recommended", options);
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
