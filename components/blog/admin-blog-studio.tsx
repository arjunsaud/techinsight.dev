"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Blog } from "@/types/domain";
import { blogService } from "@/services/blog-service";
import { BlogEditor } from "@/components/blog/editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";

interface AdminBlogStudioProps {
  accessToken: string;
  initialBlogs: Blog[];
  initialEditBlogId?: string | null;
}

function htmlToPlainText(html: string) {
  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function extractTitleFromContent(html: string) {
  if (typeof window === "undefined") {
    const plain = htmlToPlainText(html);
    return plain.slice(0, 80).trim();
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const heading = doc.body.querySelector("h1, h2, h3, h4");
  const paragraph = doc.body.querySelector("p");
  const candidate =
    heading?.textContent?.trim() || paragraph?.textContent?.trim() || "";
  return candidate.slice(0, 120).trim();
}

function makeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

function makeExcerpt(html: string) {
  const text = htmlToPlainText(html);
  if (!text) {
    return "";
  }
  return text.length > 220 ? `${text.slice(0, 220).trim()}...` : text;
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

  if (!inUse.has(fallback)) {
    return fallback;
  }

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
}: AdminBlogStudioProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("<p></p>");
  const [editingBlogId, setEditingBlogId] = useState<string | null>(
    initialEditBlogId,
  );
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const blogsQuery = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: () =>
      blogService.listAdmin(
        {
          page: 1,
          pageSize: 100,
        },
        accessToken,
      ),
    initialData: {
      data: initialBlogs,
      page: 1,
      pageSize: 100,
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
    if (!initialEditBlogId) {
      return;
    }
    const blog = blogs.find((item) => item.id === initialEditBlogId);
    if (!blog) {
      return;
    }
    setEditingBlogId(blog.id);
    setContent(blog.content || "<p></p>");
    setSlug(blog.slug || "");
    setIsSlugManual(true);
    setFeaturedImageUrl(blog.featured_image_url || "");
    setSeoTitle(blog.seoTitle || "");
    setMetaDescription(blog.metaDescription || blog.excerpt || "");
    setKeywords(blog.keywords || "");
  }, [blogs, initialEditBlogId]);

  const inferredTitle = useMemo(() => {
    const parsed = extractTitleFromContent(content);
    return parsed || "Untitled Post";
  }, [content]);

  useEffect(() => {
    if (!isSlugManual) {
      setSlug(makeSlug(inferredTitle));
    }
  }, [inferredTitle, isSlugManual]);

  const inferredSlug = useMemo(() => {
    return makeSlug(inferredTitle);
  }, [inferredTitle]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const draft = await blogService.getUploadDraft(file.name, accessToken);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", draft.apiKey);
      formData.append("timestamp", draft.timestamp.toString());
      formData.append("signature", draft.signature);
      formData.append("folder", draft.folder);
      if (draft.uploadPreset) {
        formData.append("upload_preset", draft.uploadPreset);
      }

      const response = await fetch(draft.uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }

      const result = await response.json();
      setFeaturedImageUrl(result.secure_url);
      toast.success("Thumbnail uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload thumbnail");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const saveBlogMutation = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      if (!accessToken) {
        throw new Error("Missing admin session token.");
      }

      const plainText = htmlToPlainText(content);
      if (plainText.length < 5) {
        throw new Error("Write some content before saving.");
      }

      const rawTitle = extractTitleFromContent(content);
      const title = rawTitle.length >= 2 ? rawTitle : "Untitled Post";
      const finalSlug = makeUniqueSlug(
        makeSlug(slug || title),
        blogs,
        editingBlogId,
      );
      const excerpt = metaDescription || makeExcerpt(content);

      if (editingBlog) {
        return blogService.update(
          {
            id: editingBlog.id,
            title,
            slug: finalSlug,
            content,
            excerpt,
            status,
            categoryId: editingBlog.category_id ?? undefined,
            featuredImageUrl: featuredImageUrl || undefined,
            tagIds: editingBlog.tags?.map((tag) => tag.id) ?? [],
            seoTitle: seoTitle || undefined,
            metaDescription: metaDescription || undefined,
            keywords: keywords || undefined,
          },
          accessToken,
        );
      }

      return blogService.create(
        {
          title,
          slug: finalSlug,
          content,
          excerpt,
          status,
          featuredImageUrl: featuredImageUrl || undefined,
          seoTitle: seoTitle || undefined,
          metaDescription: metaDescription || undefined,
          keywords: keywords || undefined,
          tagIds: [],
        },
        accessToken,
      );
    },
    onSuccess: (savedBlog, status) => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success(status === "published" ? "Blog published" : "Draft saved");
      setEditingBlogId(savedBlog.id);
      setContent(savedBlog.content || content);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to save blog",
      );
    },
  });

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Main content area (Left, 80%) */}
      <div className="flex-1 lg:w-[80%]">
        <div className="mb-8 flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground/60 select-none">
            <span className="font-medium">vitafy.local</span>
            <span>/</span>
            <span>blogs</span>
            <span>/</span>
          </div>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(makeSlug(e.target.value));
              setIsSlugManual(true);
            }}
            placeholder="url-slug"
            className="flex-1 bg-transparent font-medium text-foreground outline-none placeholder:text-muted-foreground/40"
          />
          {isSlugManual && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] uppercase tracking-wider"
              onClick={() => setIsSlugManual(false)}
            >
              Auto
            </Button>
          )}
        </div>

        {/* Thumbnail Image Bar */}
        <div className="mb-8 flex items-center gap-2 rounded-lg border bg-muted/10 px-4 py-3 text-sm">
          <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground/60 select-none">
            <span className="font-semibold uppercase tracking-tighter text-[10px]">
              Thumbnail
            </span>
            <span className="h-4 w-[1px] bg-border" />
          </div>
          <input
            type="text"
            value={featuredImageUrl}
            onChange={(e) => setFeaturedImageUrl(e.target.value)}
            placeholder="Thumbnail URL or upload"
            className="flex-1 bg-transparent font-medium text-foreground outline-none placeholder:text-muted-foreground/30"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted/50"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {isUploading ? "Uploading..." : "Upload"}
          </Button>

          {featuredImageUrl && (
            <div className="h-8 w-12 shrink-0 rounded border bg-muted p-0.5 overflow-hidden">
              <img
                src={featuredImageUrl}
                alt="Thumbnail Preview"
                className="h-full w-full object-cover rounded-[1px]"
              />
            </div>
          )}
        </div>

        <BlogEditor value={content} onChange={setContent} />
      </div>

      {/* Sidebar area (Right, 20%) */}
      <aside className="lg:w-[20%] space-y-6">
        <Card className="shadow-sm border-muted">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest">
              SEO & Sidebar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider px-1">
                  SEO Title
                </label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Custom browser title..."
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider px-1">
                  SEO Description
                </label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Compelling search snippet..."
                  className="min-h-[80px] text-xs resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider px-1">
                  SEO Keywords
                </label>
                <Textarea
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="tech, blog, nextjs..."
                  className="min-h-[60px] text-xs resize-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => saveBlogMutation.mutate("draft")}
                disabled={saveBlogMutation.isPending}
              >
                {saveBlogMutation.isPending ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => saveBlogMutation.mutate("published")}
                disabled={saveBlogMutation.isPending}
              >
                {saveBlogMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
              {editingBlog ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    setEditingBlogId(null);
                    setContent("<p></p>");
                  }}
                >
                  New Blog
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
