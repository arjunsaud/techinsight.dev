"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { seriesService } from "@/services/series-service";
import { SeriesPost } from "@/types/domain";
import { CoverImageUploader } from "@/components/article/cover-image-uploader";
import { ArticleEditor } from "@/components/article/editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SeriesPostSettings } from "./series-post-settings";

interface SeriesPostEditorProps {
  seriesId: string;
  initialPost?: SeriesPost;
  accessToken: string;
}

export function SeriesPostEditor({
  seriesId,
  initialPost,
  accessToken,
}: SeriesPostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialPost?.title || "",
    slug: initialPost?.slug || "",
    content: initialPost?.content || "<p></p>",
    excerpt: initialPost?.excerpt || "",
    featuredImageUrl: initialPost?.featuredImageUrl || "",
    status: initialPost?.status || "draft",
    seriesOrder: initialPost?.seriesOrder ?? 0,
    seoTitle: initialPost?.seoTitle || "",
    metaDescription: initialPost?.metaDescription || "",
    keywords: initialPost?.keywords || "",
    showToc: initialPost?.showToc ?? false,
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialPost && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, initialPost]);

  const handleSave = async (status: "draft" | "published") => {
    if (!formData.title || !formData.content) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const data = { ...formData, status };
      if (initialPost) {
        await seriesService.updatePost(seriesId, initialPost.id, data, accessToken);
        toast.success(status === "published" ? "Post published" : "Draft updated");
      } else {
        await seriesService.createPost(seriesId, data, accessToken);
        toast.success(status === "published" ? "Post published" : "Post created");
        router.push(`/admin/series/${seriesId}`);
      }
      router.refresh();
    } catch (error) {
      toast.error("Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/80 py-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/series/${seriesId}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-gray-900 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {initialPost ? "Edit Series Article" : "New Series Article"}
            </h1>
            <p className="text-xs text-gray-400 font-medium">Drafting in series article editor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsPreview(!isPreview)}
            className="rounded-xl font-bold"
          >
            <Eye className="mr-2 h-4 w-4" />
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <SeriesPostSettings 
            initialValues={{
              slug: formData.slug,
              seoTitle: formData.seoTitle,
              metaDescription: formData.metaDescription,
              keywords: formData.keywords,
              showToc: formData.showToc
            }}
            onChange={(values) => setFormData(prev => ({ ...prev, ...values }))}
          />
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => handleSave("draft")}
            className="rounded-xl border-gray-200 font-bold hover:bg-gray-50 bg-white"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            disabled={loading}
            onClick={() => handleSave("published")}
            className="rounded-xl bg-blue-600 font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20"
          >
            <Send className="mr-2 h-4 w-4" />
            {formData.status === "published" ? "Save Changes" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl pt-8">
        {isPreview ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
             {formData.featuredImageUrl && (
              <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={formData.featuredImageUrl}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                {formData.title || "Untitled Post"}
              </h1>
              {formData.excerpt && (
                <p className="text-xl text-gray-500 leading-relaxed italic border-l-4 border-blue-500 pl-6 py-1">
                  {formData.excerpt}
                </p>
              )}
            </div>
            <div
              className="prose prose-lg prose-blue max-w-none pt-8 border-t border-gray-100"
              dangerouslySetInnerHTML={{ __html: formData.content || "" }}
            />
          </div>
        ) : (
          <div className="space-y-12 pb-24">
            {/* Title & Excerpt Section */}
            <div className="space-y-8">
               <CoverImageUploader
                url={formData.featuredImageUrl || ""}
                onChange={(url) => setFormData({ ...formData, featuredImageUrl: url })}
                accessToken={accessToken}
              />

              <div className="space-y-6">
                <textarea
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Article Title..."
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                  className="w-full resize-none overflow-hidden border-none bg-transparent p-0 text-5xl font-extrabold tracking-tight outline-none placeholder:text-gray-200 focus:ring-0 leading-tight"
                />

                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short description..."
                  className="w-full resize-none border-none bg-transparent p-0 text-xl text-gray-500 outline-none placeholder:text-gray-200 focus:ring-0 leading-relaxed"
                  rows={2}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="pt-8 border-t border-gray-100">
              <ArticleEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                accessToken={accessToken}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
