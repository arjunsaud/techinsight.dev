"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { useCreateComment } from "@/hooks/use-comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  content: z.string().min(2, "Comment must be at least 2 characters").max(2000)
});

type FormValues = z.infer<typeof schema>;

interface CommentFormProps {
  articleId: string;
}

export function CommentForm({ articleId }: CommentFormProps) {
  const [accessToken, setAccessToken] = useState<string>("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: ""
    }
  });

  const mutation = useCreateComment(articleId, accessToken);

  useEffect(() => {
    try {
      const supabase = createClient();

      supabase.auth
        .getSession()
        .then(({ data }) => {
          setAccessToken(data.session?.access_token ?? "");
        })
        .finally(() => {
          setIsLoadingAuth(false);
        });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Supabase configuration is missing");
      setIsLoadingAuth(false);
    }
  }, []);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!accessToken) {
      toast.error("Admin login required to post a comment");
      return;
    }

    try {
      await mutation.mutateAsync({ content: values.content });
      toast.success("Comment posted");
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post comment");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Textarea placeholder="Write your comment..." {...form.register("content")} />
      {form.formState.errors.content ? <p className="text-sm text-destructive">{form.formState.errors.content.message}</p> : null}
      <Button type="submit" disabled={mutation.isPending || isLoadingAuth}>
        {mutation.isPending ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  );
}
