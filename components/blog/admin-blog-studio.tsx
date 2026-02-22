"use client";

import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Blog } from "@/types/domain";
import { blogService } from "@/services/blog-service";
import { BlogEditor } from "@/components/blog/editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminBlogStudioProps {
  accessToken: string;
  initialBlogs: Blog[];
  initialEditBlogId?: string | null;
}

function htmlToPlainText(html: string) {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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
  const candidate = heading?.textContent?.trim() || paragraph?.textContent?.trim() || "";
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

function makeUniqueSlug(baseSlug: string, blogs: Blog[], editingBlogId: string | null) {
  const fallback = baseSlug || `post-${Date.now()}`;
  const inUse = new Set(
    blogs
      .filter((blog) => blog.id !== editingBlogId)
      .map((blog) => blog.slug),
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
  const [editingBlogId, setEditingBlogId] = useState<string | null>(initialEditBlogId);

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
  }, [blogs, initialEditBlogId]);

  const inferredTitle = useMemo(() => {
    const parsed = extractTitleFromContent(content);
    return parsed || "Untitled Post";
  }, [content]);

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
      const slug = makeUniqueSlug(makeSlug(title), blogs, editingBlogId);
      const excerpt = makeExcerpt(content);

      if (editingBlog) {
        return blogService.update(
          {
            id: editingBlog.id,
            title,
            slug,
            content,
            excerpt,
            status,
            categoryId: editingBlog.category_id ?? undefined,
            featuredImageUrl: editingBlog.featured_image_url ?? undefined,
            tagIds: editingBlog.tags?.map((tag) => tag.id) ?? [],
          },
          accessToken,
        );
      }

      return blogService.create(
        {
          title,
          slug,
          content,
          excerpt,
          status,
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
      toast.error(error instanceof Error ? error.message : "Failed to save blog");
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Editor</CardTitle>
          <p className="text-sm text-muted-foreground">
            Single-editor mode. Title is inferred from the first heading/paragraph.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {editingBlog
              ? `Editing: ${editingBlog.title} (${editingBlog.status})`
              : "Creating new blog"}
            <span className="ml-2">Inferred title: {inferredTitle}</span>
          </div>

          <BlogEditor value={content} onChange={setContent} />

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => saveBlogMutation.mutate("draft")}
              disabled={saveBlogMutation.isPending}
            >
              {saveBlogMutation.isPending ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => saveBlogMutation.mutate("published")}
              disabled={saveBlogMutation.isPending}
            >
              {saveBlogMutation.isPending ? "Publishing..." : "Publish"}
            </Button>
            {editingBlog ? (
              <Button
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
    </div>
  );
}
