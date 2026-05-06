"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { SeriesPost } from "@/types/domain";
import type { CreateSeriesPostInput, UpdateSeriesPostInput } from "@/types/api";
import { seriesService } from "@/services/series-service";
import { ArticleEditor } from "@/components/article/editor";
import { CoverImageUploader } from "@/components/article/cover-image-uploader";
import {
  registerSeriesPostStudioControls,
  setSeriesPostStudioState,
} from "@/components/series/series-post-studio-context";

interface SeriesPostStudioProps {
  seriesId: string;
  accessToken: string;
  initialPost?: SeriesPost | null;
}

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  featuredImageUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  showToc: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
});

type PostFormValues = z.infer<typeof postSchema>;

function makeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

export function SeriesPostStudio({
  seriesId,
  accessToken,
  initialPost,
}: SeriesPostStudioProps) {
  const queryClient = useQueryClient();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<"draft" | "published">(
    initialPost?.status || "draft"
  );
  const isSlugManual = useRef(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    mode: "onChange",
    defaultValues: {
      title: initialPost?.title || "",
      slug: initialPost?.slug || "",
      excerpt: initialPost?.excerpt || "",
      content: initialPost?.content || "<p></p>",
      featuredImageUrl: initialPost?.featuredImageUrl || "",
      seoTitle: initialPost?.seoTitle || "",
      metaDescription: initialPost?.metaDescription || "",
      keywords: initialPost?.keywords || "",
      showToc: initialPost?.showToc || false,
      isFeatured: initialPost?.isFeatured || false,
      categoryId: initialPost?.categoryId || "",
      tagIds: initialPost?.tags?.map((t) => t.id) || [],
    },
  });

  const { register, control, handleSubmit, watch, setValue, reset } = form;

  // Sync form with initial data when it arrives
  useEffect(() => {
    if (initialPost) {
      reset({
        title: initialPost.title || "",
        slug: initialPost.slug || "",
        excerpt: initialPost.excerpt || "",
        content: initialPost.content || "<p></p>",
        featuredImageUrl: initialPost.featuredImageUrl || "",
        seoTitle: initialPost.seoTitle || "",
        metaDescription: initialPost.metaDescription || "",
        keywords: initialPost.keywords || "",
        showToc: initialPost.showToc || false,
        isFeatured: initialPost.isFeatured || false,
        categoryId: initialPost.categoryId || "",
        tagIds: initialPost.tags?.map((t) => t.id) || [],
      });
    }
  }, [initialPost, reset]);

  const currentTitle = watch("title");
  const previewTitle = currentTitle;
  const previewExcerpt = watch("excerpt");
  const previewContent = watch("content");
  const previewImage = watch("featuredImageUrl");

  // Auto-generate slug from title (only for new posts)
  useEffect(() => {
    if (!isSlugManual.current && !initialPost && currentTitle) {
      setValue("slug", makeSlug(currentTitle), { shouldValidate: true });
    }
  }, [currentTitle, initialPost, setValue]);

  const savePostMutation = useMutation({
    mutationFn: async ({
      data,
      status,
    }: {
      data: PostFormValues;
      status: "draft" | "published";
    }) => {
      const payload: CreateSeriesPostInput = {
        title: data.title || "Untitled Post",
        slug: makeSlug(data.slug || data.title),
        content: data.content,
        excerpt: data.excerpt || undefined,
        status,
        featuredImageUrl: data.featuredImageUrl || undefined,
        seoTitle: data.seoTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        keywords: data.keywords || undefined,
        showToc: data.showToc,
        isFeatured: data.isFeatured,
        categoryId: data.categoryId || undefined,
        tagIds: data.tagIds,
      };

      if (initialPost) {
        return seriesService.updatePost(seriesId, initialPost.id, payload as UpdateSeriesPostInput, accessToken);
      }
      return seriesService.createPost(seriesId, payload, accessToken);
    },
    onSuccess: (savedPost, variables) => {
      queryClient.invalidateQueries({ queryKey: ["series", seriesId] });
      
      toast.success(
        variables.status === "published" ? "Post published" : "Draft saved"
      );
      setCurrentStatus(variables.status);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Failed to save"),
  });

  const onSave = (status: "draft" | "published") => {
    handleSubmit((data) => {
      savePostMutation.mutate({ data, status });
    })();
  };

  useEffect(() => {
    registerSeriesPostStudioControls({
      saveDraft: () => onSave("draft"),
      savePublished: () => onSave("published"),
      togglePreview: () => setIsPreviewMode((p) => !p),
    });
  }, [onSave]);

  useEffect(() => {
    setSeriesPostStudioState({
      isSaving: savePostMutation.isPending,
      isPreviewMode,
    });
  }, [savePostMutation.isPending, isPreviewMode]);

  return (
    <div className="mt-8 flex w-full justify-center">
      <div className="w-full max-w-4xl -translate-x-24 px-4">
        {isPreviewMode ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {previewImage && (
              <div className="aspect-[21/9] w-full overflow-hidden rounded-xl">
                <img
                  src={previewImage}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="space-y-4">
              <h1
                className="text-4xl font-bold tracking-tight"
                style={{ fontFamily: "serif" }}
              >
                {previewTitle || "Untitled Post"}
              </h1>
              {previewExcerpt && (
                <p className="text-xl text-muted-foreground/80 leading-relaxed italic">
                  {previewExcerpt}
                </p>
              )}
            </div>
            <div
              className="hashnode-render-content max-w-none pt-8 border-t"
              dangerouslySetInnerHTML={{ __html: previewContent || "" }}
            />
          </div>
        ) : (
          <form className="block">
            <Controller
              control={control}
              name="featuredImageUrl"
              render={({ field }) => (
                <CoverImageUploader
                  url={field.value || ""}
                  onChange={field.onChange}
                  accessToken={accessToken}
                  folder="series"
                />
              )}
            />

            <div className="space-y-6">
              <textarea
                {...register("title")}
                placeholder="Untitled"
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
                className="w-full resize-none overflow-hidden border-none bg-transparent p-0 text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/40"
              />

              <textarea
                {...register("excerpt")}
                placeholder="Short description..."
                className="w-full resize-none border-none bg-transparent p-0 text-xl text-muted-foreground/90 outline-none placeholder:text-muted-foreground/40 focus:ring-0"
                rows={2}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
              />

              <div className="pt-8">
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <ArticleEditor
                      value={field.value}
                      onChange={field.onChange}
                      accessToken={accessToken}
                      folder="series"
                    />
                  )}
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
