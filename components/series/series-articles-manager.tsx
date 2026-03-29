"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit2, Trash2, Plus, ArrowUp, ArrowDown, Save } from "lucide-react";
import { seriesService } from "@/services/series-service";
import { SeriesPost } from "@/types/domain";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SeriesArticlesManagerProps {
  seriesId: string;
  initialPosts: SeriesPost[];
  accessToken: string;
}

export function SeriesArticlesManager({
  seriesId,
  initialPosts,
  accessToken,
}: SeriesArticlesManagerProps) {
  const [posts, setPosts] = useState<SeriesPost[]>(initialPosts);
  const [isReordered, setIsReordered] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await seriesService.deletePost(seriesId, postId, accessToken);
      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= posts.length) return;

    const newPosts = [...posts];
    const item = newPosts[index];
    newPosts.splice(index, 1);
    newPosts.splice(newIndex, 0, item);
    
    setPosts(newPosts);
    setIsReordered(true);
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const postIds = posts.map((p) => p.id);
      await seriesService.reorderPosts(seriesId, postIds, accessToken);
      setIsReordered(false);
      toast.success("Order saved successfully");
    } catch (error: any) {
      console.error("Reorder error:", error);
      toast.error(error.message || "Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Series Content</h3>
        <div className="flex items-center gap-2">
          {isReordered && (
            <button
              onClick={handleSaveOrder}
              disabled={savingOrder}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {savingOrder ? "Saving..." : "Save Order"}
            </button>
          )}
          <Link 
            href={`/admin/series/${seriesId}/posts/new` as any}
            className={cn(
              "inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95"
            )}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Article
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
            <tr>
              <th className="w-12 px-6 py-4">#</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <tr key={post.id} className="group hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-400 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4">{index + 1}</div>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveItem(index, "up")}
                          disabled={index === 0}
                          className="group/btn flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-0 transition-all active:scale-90"
                        >
                          <ArrowUp className="h-5 w-5 stroke-[3px]" />
                        </button>
                        <button
                          onClick={() => moveItem(index, "down")}
                          disabled={index === posts.length - 1}
                          className="group/btn flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-0 transition-all active:scale-90"
                        >
                          <ArrowDown className="h-5 w-5 stroke-[3px]" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{post.title}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest leading-tight mt-0.5">
                      /{post.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Link 
                        href={`/admin/series/${seriesId}/posts/${post.id}` as any}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  No articles in this series. Click "Add Article" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
