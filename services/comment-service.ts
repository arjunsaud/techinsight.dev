import type { Comment } from "@/types/domain";
import type { CreateCommentInput } from "@/types/api";

import { apiFetch } from "@/services/http";

export const commentService = {
  listByBlog(blogId: string) {
    return apiFetch<Comment[]>("comment", {
      query: { blogId }
    });
  },

  create(input: CreateCommentInput, accessToken: string) {
    return apiFetch<Comment>("comment", {
      method: "POST",
      body: input,
      accessToken
    });
  },

  remove(commentId: string, accessToken: string) {
    return apiFetch<void>(`comment/${commentId}`, {
      method: "DELETE",
      accessToken
    });
  }
};
