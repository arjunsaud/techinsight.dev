"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateCommentInput } from "@/types/api";
import { commentService } from "@/services/comment-service";

export function useComments(articleId: string) {
  return useQuery({
    queryKey: ["comments", articleId],
    queryFn: () => commentService.listByArticle(articleId),
    enabled: Boolean(articleId)
  });
}

export function useCreateComment(articleId: string, accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateCommentInput, "articleId">) =>
      commentService.create({
        articleId,
        ...input
      }, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", articleId] });
    }
  });
}
