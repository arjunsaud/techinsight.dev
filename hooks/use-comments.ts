"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateCommentInput } from "@/types/api";
import { commentService } from "@/services/comment-service";

export function useComments(blogId: string) {
  return useQuery({
    queryKey: ["comments", blogId],
    queryFn: () => commentService.listByBlog(blogId),
    enabled: Boolean(blogId)
  });
}

export function useCreateComment(blogId: string, accessToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateCommentInput, "blogId">) =>
      commentService.create({
        blogId,
        ...input
      }, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", blogId] });
    }
  });
}
