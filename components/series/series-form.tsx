"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { seriesService } from "@/services/series-service";
import { Series } from "@/types/domain";
import { CoverImageUploader } from "@/components/article/cover-image-uploader";

interface SeriesFormProps {
  initialSeries?: Series;
  accessToken: string;
  onSuccess?: (series: Series) => void;
}

export function SeriesForm({ initialSeries, accessToken, onSuccess }: SeriesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialSeries?.title || "",
    slug: initialSeries?.slug || "",
    description: initialSeries?.description || "",
    coverImage: initialSeries?.coverImage || "",
    status: initialSeries?.status || "draft",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialSeries) {
        const updated = await seriesService.update(initialSeries.id, formData, accessToken);
        toast.success("Series updated");
        onSuccess?.(updated as any);
      } else {
        const created = await seriesService.create(formData, accessToken);
        toast.success("Series created");
        if (onSuccess) {
          onSuccess(created);
        } else {
          router.push(`/admin/series/${created.id}`);
        }
      }
      router.refresh();
    } catch (error) {
      toast.error("Failed to save series");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cover Image Section */}
      <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold text-foreground">Cover Image</h3>
        <CoverImageUploader 
          url={formData.coverImage || ""} 
          onChange={(url) => setFormData({ ...formData, coverImage: url })} 
          accessToken={accessToken} 
        />
      </div>

      {/* Basic Info Section */}
      <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold text-foreground">Basic Info</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Series Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-none"
              placeholder="e.g. Mastering Next.js"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-none"
              placeholder="e.g. mastering-next-js"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="h-32 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-none resize-none"
              placeholder="Briefly describe what this series covers..."
            />
          </div>
        </div>
      </div>

      {/* Status & Visibility Section */}
      <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
        <h3 className="text-sm font-semibold text-foreground">Status & Visibility</h3>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Current Status</label>
            <p className="text-xs text-muted-foreground">Set the publication state</p>
          </div>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Saving..." : initialSeries ? "Update Metadata" : "Create Series"}
        </button>
      </div>
    </form>
  );
}
