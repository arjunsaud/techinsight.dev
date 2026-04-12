"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Search, 
  X,
  GripVertical
} from "lucide-react";
import { seriesService } from "@/services/series-service";
import { SeriesPost } from "@/types/domain";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/article/admin-article-card";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isReordered, setIsReordered] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const query = searchQuery.toLowerCase();
    return posts.filter(
      (p) => 
        p.title.toLowerCase().includes(query) || 
        p.slug.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Remove this article from the series?")) return;

    try {
      await seriesService.deletePost(seriesId, postId, accessToken);
      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("Article removed from series");
    } catch (error) {
      toast.error("Failed to remove article");
    }
  };

  const moveItem = (indexInPosts: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? indexInPosts - 1 : indexInPosts + 1;
    if (newIndex < 0 || newIndex >= posts.length) return;

    const newPosts = [...posts];
    const item = newPosts[indexInPosts];
    newPosts.splice(indexInPosts, 1);
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
      toast.error(error.message || "Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Series Curriculum
          </h3>
          <p className="text-sm text-muted-foreground">
            {posts.length} articles in this series
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isReordered && (
            <Button
              onClick={handleSaveOrder}
              disabled={savingOrder}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 h-10 px-4"
              size="sm"
            >
              <Save className="h-4 w-4" />
              {savingOrder ? "Saving..." : "Save Sequence"}
            </Button>
          )}
          <Link href={`/admin/series/${seriesId}/posts/new` as any} className="flex-1 sm:flex-initial">
            <Button className="w-full gap-2 h-10 px-4">
              <Plus className="h-4 w-4" />
              Add Article
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Filter articles in series..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Card List */}
      <div className="space-y-4 pb-20">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => {
            // Find official index in main posts array for reordering logic
            const originalIndex = posts.findIndex(p => p.id === post.id);
            
            return (
              <div key={post.id} className="relative flex items-center gap-4">
                {/* Reorder Controls - Floats to the left of the ArticleCard */}
                <div className="flex flex-col gap-1 shrink-0 bg-muted/50 rounded-lg p-1 opacity-40 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => moveItem(originalIndex, "up")}
                    disabled={originalIndex === 0 || searchQuery !== ""}
                    className="p-1 text-muted-foreground hover:bg-background hover:text-primary rounded-md disabled:opacity-0 transition-all"
                    title="Move Up"
                  >
                    <ArrowUp className="h-4 w-4 stroke-[2.5px]" />
                  </button>
                  <div className="flex flex-col items-center justify-center min-w-[20px]">
                    <span className="text-[10px] font-bold text-muted-foreground/50 tabular-nums">
                      {originalIndex + 1}
                    </span>
                    <GripVertical className="h-3 w-3 text-muted-foreground/20" />
                  </div>
                  <button
                    onClick={() => moveItem(originalIndex, "down")}
                    disabled={originalIndex === posts.length - 1 || searchQuery !== ""}
                    className="p-1 text-muted-foreground hover:bg-background hover:text-primary rounded-md disabled:opacity-0 transition-all"
                    title="Move Down"
                  >
                    <ArrowDown className="h-4 w-4 stroke-[2.5px]" />
                  </button>
                </div>

                {/* Reuse the global ArticleCard for consistent UI */}
                <div className="flex-1">
                  <ArticleCard id={post.id} slug={post.slug}>
                    <ArticleCard.Image 
                      src={post.featuredImageUrl || null} 
                      alt={post.title} 
                    />
                    <ArticleCard.Content
                      title={post.title}
                      excerpt={post.excerpt || null}
                      status={post.status}
                      tags={[]} // Series posts tags not currently loaded in this view
                      views={0}
                      likes={0}
                      comments={0}
                      readTime="5m"
                    />
                    <ArticleCard.Actions
                      onDelete={() => handleDeletePost(post.id)}
                    />
                  </ArticleCard>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed text-muted-foreground bg-muted/20">
            <p className="text-lg font-medium">No results matched your search.</p>
            <p className="text-sm">Try using different keywords or clear the filter.</p>
            <Button 
              variant="link" 
              onClick={() => setSearchQuery("")}
              className="text-primary mt-2"
            >
              Clear filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


