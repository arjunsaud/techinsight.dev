import type { Blog } from "@/types/domain";
import type {
  BlogFilterInput,
  CreateBlogInput,
  PaginatedResponse,
  UpdateBlogInput,
} from "@/types/api";

import { apiFetch } from "@/services/http";

export const blogService = {
  listPublished(filters: BlogFilterInput = {}) {
    const query = {
      query: filters.query,
      category: filters.category,
      tag: filters.tag,
      page: filters.page,
      pageSize: filters.pageSize,
      status: "published" as const,
    };

    return apiFetch<PaginatedResponse<Blog>>("blog", {
      query,
    });
  },

  listAdmin(filters: BlogFilterInput = {}, accessToken?: string) {
    const query = {
      query: filters.query,
      category: filters.category,
      tag: filters.tag,
      page: filters.page,
      pageSize: filters.pageSize,
      status: filters.status,
    };

    return apiFetch<PaginatedResponse<Blog>>("blog", {
      query,
      accessToken,
    });
  },

  getBySlug(slug: string) {
    return apiFetch<Blog>(`blog/${slug}`);
  },

  create(input: CreateBlogInput, accessToken: string) {
    return apiFetch<Blog>("blog", {
      method: "POST",
      body: input,
      accessToken,
    });
  },

  update(input: UpdateBlogInput, accessToken: string) {
    return apiFetch<Blog>(`blog/${input.id}`, {
      method: "PATCH",
      body: input,
      accessToken,
    });
  },

  remove(blogId: string, accessToken: string) {
    return apiFetch<void>(`blog/${blogId}`, {
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
    }>("blog/upload-url", {
      method: "POST",
      body: { filename },
      accessToken,
    });
  },
};
