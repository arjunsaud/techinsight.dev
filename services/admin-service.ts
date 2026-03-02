import type { AdminComment, AppUser, Category, Tag } from "@/types/domain";
import type { DashboardResponse } from "@/types/api";

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

  listUsers(accessToken: string) {
    return apiFetch<AppUser[]>("admin/users", {
      accessToken,
    });
  },

  listComments(accessToken: string) {
    return apiFetch<AdminComment[]>("admin/comments", {
      accessToken,
    });
  },

  listCategories(
    accessToken?: string,
    options: { next?: NextFetchRequestConfig; cache?: RequestCache } = {},
  ) {
    return apiFetch<Category[]>("category", {
      accessToken,
      ...options,
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
    options: { next?: NextFetchRequestConfig; cache?: RequestCache } = {},
  ) {
    return apiFetch<Tag[]>("tag", {
      accessToken,
      ...options,
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
