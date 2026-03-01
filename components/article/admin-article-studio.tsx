"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { Article } from "@/types/domain";
import { articleService } from "@/services/article-service";
import { ArticleEditor } from "@/components/article/editor";
import { CoverImageUploader } from "./cover-image-uploader";
import {
  registerAdminStudioControls,
  setAdminStudioState,
} from "@/components/article/admin-studio-context";

interface HashnodeStudioProps {
  accessToken: string;
  initialArticles: Article[];
  initialEditArticleId?: string | null;
}

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string(),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  featuredImageUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
});
type ArticleFormValues = z.infer<typeof articleSchema>;

function htmlToPlainText(html: string) {
  if (typeof window === "undefined")
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function makeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

function makeUniqueSlug(
  baseSlug: string,
  articles: Article[],
  editingArticleId: string | null,
) {
  const fallback = baseSlug || `post-${Date.now()}`;
  const inUse = new Set(
    articles
      .filter((article) => article.id !== editingArticleId)
      .map((article) => article.slug),
  );
  if (!inUse.has(fallback)) return fallback;
  let counter = 2;
  let next = `${fallback}-${counter}`;
  while (inUse.has(next)) {
    counter += 1;
    next = `${fallback}-${counter}`;
  }
  return next;
}

export function AdminArticleStudio({
  accessToken,
  initialArticles,
  initialEditArticleId = null,
}: HashnodeStudioProps) {
  const queryClient = useQueryClient();
  const [editingArticleId, setEditingArticleId] = useState<string | null>(
    initialEditArticleId,
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const isSlugManual = useRef(false);

  const articlesQuery = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () =>
      articleService.listAdmin({ page: 1, pageSize: 100 }, accessToken),
    initialData: {
      data: initialArticles,
      page: 1,
      pageSize: 200,
      total: initialArticles.length,
    },
    enabled: Boolean(accessToken),
  });

  const articles = articlesQuery.data?.data ?? [];
  const editingArticle = useMemo(
    () => articles.find((article) => article.id === editingArticleId) ?? null,
    [articles, editingArticleId],
  );

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "<p></p>",
      featuredImageUrl: "",
      seoTitle: "",
      metaDescription: "",
      keywords: "",
    },
  });

  const { register, control, handleSubmit, watch, reset, setValue } = form;

  const currentTitle = watch("title");
  const previewTitle = currentTitle;
  const previewExcerpt = watch("excerpt");
  const previewContent = watch("content");
  const previewImage = watch("featuredImageUrl");
  const currentKeywords = watch("keywords");
  const currentSeoTitle = watch("seoTitle");
  const currentMetaDescription = watch("metaDescription");

  useEffect(() => {
    if (!initialEditArticleId) return;
    const article = articles.find((item) => item.id === initialEditArticleId);
    if (!article) return;
    setEditingArticleId(article.id);
    isSlugManual.current = true;
    reset({
      title: article.title || "",
      slug: article.slug || "",
      excerpt: article.excerpt || "",
      content: article.content || "<p></p>",
      featuredImageUrl: article.featured_image_url || "",
      seoTitle: article.seoTitle || "",
      metaDescription: article.metaDescription || article.excerpt || "",
      keywords: article.keywords || "",
    });
  }, [articles, initialEditArticleId, reset]);

  useEffect(() => {
    if (!isSlugManual.current && currentTitle) {
      setValue("slug", makeSlug(currentTitle), { shouldValidate: true });
    }
  }, [currentTitle, setValue]);

  // Derived state (for features like analysis panel if needed elsewhere)
  const analysis = useMemo(() => {
    const plainText = htmlToPlainText(previewContent || "");
    const words = plainText.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(words / 200);
    const activeKeywords = (currentKeywords || "")
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    const foundKeywords = activeKeywords.filter((k) =>
      plainText.toLowerCase().includes(k),
    ).length;

    return {
      words,
      readingTime,
      keywordsFound: foundKeywords,
      totalKeywords: activeKeywords.length,
      seoTitleLength: (currentSeoTitle || "").length,
      metaDescriptionLength: (currentMetaDescription || "").length,
      isTitleGood:
        (currentSeoTitle || "").length >= 30 &&
        (currentSeoTitle || "").length <= 60,
      isDescriptionGood:
        (currentMetaDescription || "").length >= 120 &&
        (currentMetaDescription || "").length <= 160,
    };
  }, [
    previewContent,
    currentSeoTitle,
    currentMetaDescription,
    currentKeywords,
  ]);

  const saveArticleMutation = useMutation({
    mutationFn: async ({
      data,
      status,
    }: {
      data: ArticleFormValues;
      status: "draft" | "published";
    }) => {
      const finalSlug = makeUniqueSlug(
        makeSlug(data.slug || data.title),
        articles,
        editingArticleId,
      );
      const payload = {
        title: data.title || "Untitled Post",
        slug: finalSlug,
        content: data.content,
        excerpt: data.excerpt || undefined,
        status,
        featuredImageUrl: data.featuredImageUrl || undefined,
        seoTitle: data.seoTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        keywords: data.keywords || undefined,
        tagIds: editingArticle?.tags?.map((t) => t.id) ?? [],
        categoryId: editingArticle?.category_id ?? undefined,
      };

      if (editingArticle)
        return articleService.update(
          { ...payload, id: editingArticle.id },
          accessToken,
        );
      return articleService.create(payload, accessToken);
    },
    onSuccess: (savedArticle, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success(
        variables.status === "published" ? "Article published" : "Draft saved",
      );
      setEditingArticleId(savedArticle.id);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Failed to save"),
  });

  const onSave = (status: "draft" | "published") => {
    handleSubmit((data) => {
      saveArticleMutation.mutate({ data, status });
    })();
  };

  useEffect(() => {
    registerAdminStudioControls({
      saveDraft: () => onSave("draft"),
      savePublished: () => onSave("published"),
      togglePreview: () => setIsPreviewMode((p) => !p),
    });
  }, [onSave]);

  useEffect(() => {
    setAdminStudioState({
      isSaving: saveArticleMutation.isPending,
      isPreviewMode,
    });
  }, [saveArticleMutation.isPending, isPreviewMode]);

  return (
    <div className="mt-8 flex w-full justify-center">
      <div className="w-full max-w-3xl px-4">
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
                className="text-5xl font-bold tracking-tight"
                style={{ fontFamily: "serif" }}
              >
                {previewTitle || "Untitled Post"}
              </h1>
              {previewExcerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed italic">
                  {previewExcerpt}
                </p>
              )}
            </div>
            <div
              className="prose prose-lg dark:prose-invert max-w-none pt-8 border-t"
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
                />
              )}
            />

            <div className="space-y-6">
              <input
                {...register("title")}
                type="text"
                placeholder="Article Title"
                className="w-full border-none bg-transparent p-0 text-5xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/30 focus:ring-0"
                style={{ fontFamily: "serif" }}
              />

              <textarea
                {...register("excerpt")}
                placeholder="Short description..."
                className="w-full resize-none border-none bg-transparent p-0 text-xl text-muted-foreground/60 outline-none placeholder:text-muted-foreground/20 focus:ring-0"
                rows={2}
              />

              <div className="pt-8">
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <ArticleEditor
                      value={field.value}
                      onChange={field.onChange}
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
