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
      accessToken
    });
  },

  listUsers(accessToken: string) {
    return apiFetch<AppUser[]>("admin/users", {
      accessToken
    });
  },

  listComments(accessToken: string) {
    return apiFetch<AdminComment[]>("admin/comments", {
      accessToken,
    });
  },

  listCategories(accessToken?: string) {
    return apiFetch<Category[]>("blog/categories", {
      accessToken
    });
  },

  createCategory(name: string, accessToken: string) {
    return apiFetch<Category>("blog/categories", {
      method: "POST",
      accessToken,
      body: { name }
    });
  },

  updateCategory(categoryId: string, input: { name?: string; slug?: string }, accessToken: string) {
    return apiFetch<Category>(`blog/categories/${categoryId}`, {
      method: "PATCH",
      accessToken,
      body: input
    });
  },

  removeCategory(categoryId: string, accessToken: string) {
    return apiFetch<void>(`blog/categories/${categoryId}`, {
      method: "DELETE",
      accessToken
    });
  },

  listTags(accessToken?: string) {
    return apiFetch<Tag[]>("blog/tags", {
      accessToken
    });
  },

  createTag(name: string, accessToken: string) {
    return apiFetch<Tag>("blog/tags", {
      method: "POST",
      accessToken,
      body: { name }
    });
  },

  updateTag(tagId: string, input: { name?: string; slug?: string }, accessToken: string) {
    return apiFetch<Tag>(`blog/tags/${tagId}`, {
      method: "PATCH",
      accessToken,
      body: input
    });
  },

  removeTag(tagId: string, accessToken: string) {
    return apiFetch<void>(`blog/tags/${tagId}`, {
      method: "DELETE",
      accessToken
    });
  },
};
