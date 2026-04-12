import type { AdminComment, AppUser, Category, Tag } from "@/types/domain";
import type { DashboardResponse, PaginatedResponse } from "@/types/api";

import { apiFetch } from "@/services/http";

export const adminService = {
  getMe(accessToken: string) {
    return apiFetch<Pick<AppUser, "id" | "email" | "role">>("admin/me", {
      accessToken,
    });
  },

  getDashboard(accessToken: string) {
    return apiFetch<DashboardResponse>("admin/dashboard", {
      accessToken,
    });
  },

  listUsers(accessToken: string, page = 1, pageSize = 50) {
    return apiFetch<PaginatedResponse<AppUser>>("admin/users", {
      accessToken,
      query: { page: page.toString(), pageSize: pageSize.toString() },
    });
  },

  listComments(accessToken: string, page = 1, pageSize = 50) {
    return apiFetch<PaginatedResponse<AdminComment>>("admin/comments", {
      accessToken,
      query: { page: page.toString(), pageSize: pageSize.toString() },
    });
  },

  listCategories(
    accessToken?: string,
    options: { next?: NextFetchRequestConfig; cache?: RequestCache; page?: number; pageSize?: number } = {},
  ) {
    const { page = 1, pageSize = 1000, ...fetchOptions } = options;
    return apiFetch<PaginatedResponse<Category>>("category", {
      accessToken,
      query: { page: page.toString(), pageSize: pageSize.toString() },
      ...fetchOptions,
    });
  },

  createCategory(
    name: string,
    description: string | null,
    accessToken: string,
  ) {
    return apiFetch<Category>("category", {
      method: "POST",
      accessToken,
      body: { name, description },
    });
  },

  updateCategory(
    categoryId: string,
    input: {
      name?: string;
      slug?: string;
      description?: string | null;
      color?: string | null;
    },
    accessToken: string,
  ) {
    return apiFetch<Category>(`category/${categoryId}`, {
      method: "PATCH",
      accessToken,
      body: input,
    });
  },

  removeCategory(categoryId: string, accessToken: string) {
    return apiFetch<void>(`category/${categoryId}`, {
      method: "DELETE",
      accessToken,
    });
  },

  listTags(
    accessToken?: string,
    options: { next?: NextFetchRequestConfig; cache?: RequestCache; page?: number; pageSize?: number } = {},
  ) {
    const { page = 1, pageSize = 1000, ...fetchOptions } = options;
    return apiFetch<PaginatedResponse<Tag>>("tag", {
      accessToken,
      query: { page: page.toString(), pageSize: pageSize.toString() },
      ...fetchOptions,
    });
  },

  createTag(name: string, accessToken: string) {
    return apiFetch<Tag>("tag", {
      method: "POST",
      accessToken,
      body: { name },
    });
  },

  updateTag(
    tagId: string,
    input: { name?: string; slug?: string },
    accessToken: string,
  ) {
    return apiFetch<Tag>(`tag/${tagId}`, {
      method: "PATCH",
      accessToken,
      body: input,
    });
  },

  removeTag(tagId: string, accessToken: string) {
    return apiFetch<void>(`tag/${tagId}`, {
      method: "DELETE",
      accessToken,
    });
  },
};
