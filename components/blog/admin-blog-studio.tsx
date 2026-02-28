"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {} from "lucide-react";

import type { Blog } from "@/types/domain";
import { blogService } from "@/services/blog-service";
import { BlogEditor } from "@/components/blog/editor";
import { CoverImageUploader } from "./cover-image-uploader";
import {
  registerAdminStudioControls,
  setAdminStudioState,
} from "@/components/blog/admin-studio-context";

interface HashnodeStudioProps {
  accessToken: string;
  initialBlogs: Blog[];
  initialEditBlogId?: string | null;
}

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
  blogs: Blog[],
  editingBlogId: string | null,
) {
  const fallback = baseSlug || `post-${Date.now()}`;
  const inUse = new Set(
    blogs.filter((blog) => blog.id !== editingBlogId).map((blog) => blog.slug),
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

export function AdminBlogStudio({
  accessToken,
  initialBlogs,
  initialEditBlogId = null,
}: HashnodeStudioProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("<p></p>");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [editingBlogId, setEditingBlogId] = useState<string | null>(
    initialEditBlogId,
  );
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const blogsQuery = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: () =>
      blogService.listAdmin({ page: 1, pageSize: 100 }, accessToken),
    initialData: {
      data: initialBlogs,
      page: 1,
      pageSize: 200,
      total: initialBlogs.length,
    },
    enabled: Boolean(accessToken),
  });

  const blogs = blogsQuery.data?.data ?? [];
  const editingBlog = useMemo(
    () => blogs.find((blog) => blog.id === editingBlogId) ?? null,
    [blogs, editingBlogId],
  );

  useEffect(() => {
    if (!initialEditBlogId) return;
    const blog = blogs.find((item) => item.id === initialEditBlogId);
    if (!blog) return;
    setEditingBlogId(blog.id);
    setTitle(blog.title || "");
    setExcerpt(blog.excerpt || "");
    setContent(blog.content || "<p></p>");
    setSlug(blog.slug || "");
    setIsSlugManual(true);
    setFeaturedImageUrl(blog.featured_image_url || "");
    setSeoTitle(blog.seoTitle || "");
    setMetaDescription(blog.metaDescription || blog.excerpt || "");
    setKeywords(blog.keywords || "");
  }, [blogs, initialEditBlogId]);

  useEffect(() => {
    if (!isSlugManual && title) setSlug(makeSlug(title));
  }, [title, isSlugManual]);

  const analysis = useMemo(() => {
    const plainText = htmlToPlainText(content);
    const words = plainText.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(words / 200);
    const activeKeywords = keywords
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
      seoTitleLength: seoTitle.length,
      metaDescriptionLength: metaDescription.length,
      isTitleGood: seoTitle.length >= 30 && seoTitle.length <= 60,
      isDescriptionGood:
        metaDescription.length >= 120 && metaDescription.length <= 160,
    };
  }, [content, seoTitle, metaDescription, keywords]);

  const saveBlogMutation = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      const finalSlug = makeUniqueSlug(
        makeSlug(slug || title),
        blogs,
        editingBlogId,
      );
      const payload = {
        title: title || "Untitled Post",
        slug: finalSlug,
        content,
        excerpt: excerpt || undefined,
        status,
        featuredImageUrl: featuredImageUrl || undefined,
        seoTitle: seoTitle || undefined,
        metaDescription: metaDescription || undefined,
        keywords: keywords || undefined,
        tagIds: editingBlog?.tags?.map((t) => t.id) ?? [],
        categoryId: editingBlog?.category_id ?? undefined,
      };

      if (editingBlog)
        return blogService.update(
          { ...payload, id: editingBlog.id },
          accessToken,
        );
      return blogService.create(payload, accessToken);
    },
    onSuccess: (savedBlog, status) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success(status === "published" ? "Blog published" : "Draft saved");
      setEditingBlogId(savedBlog.id);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Failed to save"),
  });

  useEffect(() => {
    registerAdminStudioControls({
      saveDraft: () => saveBlogMutation.mutate("draft"),
      savePublished: () => saveBlogMutation.mutate("published"),
      togglePreview: () => setIsPreviewMode((p) => !p),
    });
  }, [saveBlogMutation]);

  useEffect(() => {
    setAdminStudioState({
      isSaving: saveBlogMutation.isPending,
      isPreviewMode,
    });
  }, [saveBlogMutation.isPending, isPreviewMode]);

  return (
        <div className="mt-8 flex w-full justify-center">
          <div className="w-full max-w-3xl px-4">
          {isPreviewMode ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {featuredImageUrl && (
                <div className="aspect-[21/9] w-full overflow-hidden rounded-xl">
                  <img
                    src={featuredImageUrl}
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
                  {title || "Untitled Post"}
                </h1>
                {excerpt && (
                  <p className="text-xl text-muted-foreground leading-relaxed italic">
                    {excerpt}
                  </p>
                )}
              </div>
              <div
                className="prose prose-lg dark:prose-invert max-w-none pt-8 border-t"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          ) : (
            <div>
              <CoverImageUploader
                url={featuredImageUrl}
                onChange={setFeaturedImageUrl}
                accessToken={accessToken}
              />

              <div className="space-y-6">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article Title"
                  className="w-full border-none bg-transparent p-0 text-5xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/30 focus:ring-0"
                  style={{ fontFamily: "serif" }}
                />

                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short description..."
                  className="w-full resize-none border-none bg-transparent p-0 text-xl text-muted-foreground/60 outline-none placeholder:text-muted-foreground/20 focus:ring-0"
                  rows={2}
                />

                <div className="pt-8">
                  <BlogEditor value={content} onChange={setContent} />
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
  );
}
