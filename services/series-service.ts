import type { Series, PostSeriesInfo, SeriesPost } from "@/types/domain";
import type {
  CreateSeriesPostInput,
  UpdateSeriesPostInput,
  PaginatedResponse,
} from "@/types/api";
import { apiFetch } from "@/services/http";

export const seriesService = {
  async list(
    options: {
      next?: NextFetchRequestConfig;
      cache?: RequestCache;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<PaginatedResponse<Series>> {
    const { page = 1, pageSize = 50, ...fetchOptions } = options;
    return apiFetch<PaginatedResponse<Series>>("series", {
      query: { page: page.toString(), pageSize: pageSize.toString() },
      ...fetchOptions,
    });
  },

  async getBySlug(
    slug: string,
    withPosts = false,
    options: { next?: NextFetchRequestConfig; cache?: RequestCache } = {},
  ): Promise<Series> {
    return apiFetch<Series>(`series/${slug}`, {
      ...options,
      query: withPosts ? { withPosts: "true" } : undefined,
    });
  },

  async getById(
    id: string,
    accessToken?: string,
    options: { next?: NextFetchRequestConfig; cache?: RequestCache } = {},
  ): Promise<Series> {
    return apiFetch<Series>(`series/${id}`, {
      ...options,
      accessToken,
      query: { withPosts: "true" },
    });
  },

  async getPostSeriesInfo(
    postSlug: string,
    options: { next?: NextFetchRequestConfig; cache?: RequestCache } = {},
  ): Promise<PostSeriesInfo> {
    return apiFetch<PostSeriesInfo>(`series/post/${postSlug}`, options);
  },

  async create(data: Partial<Series>, accessToken: string): Promise<Series> {
    return apiFetch<Series>("series", {
      method: "POST",
      body: data,
      accessToken,
    });
  },

  async update(
    id: string,
    data: Partial<Series>,
    accessToken: string,
  ): Promise<Series> {
    return apiFetch<Series>(`series/${id}`, {
      method: "PATCH",
      body: data,
      accessToken,
    });
  },

  async delete(id: string, accessToken: string): Promise<void> {
    return apiFetch<void>(`series/${id}`, {
      method: "DELETE",
      accessToken,
    });
  },

  // Standalone Series Posts CRUD
  async getPostById(
    seriesId: string,
    postId: string,
    accessToken: string,
  ): Promise<SeriesPost> {
    return apiFetch<SeriesPost>(`series/${seriesId}/posts/${postId}`, {
      accessToken,
    });
  },

  async getPostBySlug(slug: string): Promise<SeriesPost> {
    return apiFetch<SeriesPost>(`series/post/slug/${slug}`);
  },

  async createPost(
    seriesId: string,
    data: CreateSeriesPostInput,
    accessToken: string,
  ): Promise<SeriesPost> {
    return apiFetch<SeriesPost>(`series/${seriesId}/posts`, {
      method: "POST",
      body: data,
      accessToken,
    });
  },

  async updatePost(
    seriesId: string,
    postId: string,
    data: UpdateSeriesPostInput,
    accessToken: string,
  ): Promise<SeriesPost> {
    return apiFetch<SeriesPost>(`series/${seriesId}/posts/${postId}`, {
      method: "PATCH",
      body: data,
      accessToken,
    });
  },

  async reorderPosts(
    seriesId: string,
    postIds: string[],
    accessToken: string,
  ): Promise<void> {
    await apiFetch(`series/${seriesId}/reorder`, {
      method: "POST",
      body: { postIds },
      accessToken,
    });
  },

  async deletePost(
    seriesId: string,
    postId: string,
    accessToken: string,
  ): Promise<void> {
    return apiFetch<void>(`series/${seriesId}/posts/${postId}`, {
      method: "DELETE",
      accessToken,
    });
  },
};
