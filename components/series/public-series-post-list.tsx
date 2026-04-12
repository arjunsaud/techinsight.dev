import { SeriesPost } from "@/types/domain";
import { PublicSeriesPostCard } from "./public-series-post-card";

interface PublicSeriesPostListProps {
  posts: SeriesPost[];
  seriesSlug: string;
}

export function PublicSeriesPostList({ posts, seriesSlug }: PublicSeriesPostListProps) {
  if (posts.length === 0) {
    return (
      <div className="py-24 text-center rounded-3xl border-2 border-dashed border-gray-100">
        <p className="text-base text-gray-400">
          No articles in this series yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <PublicSeriesPostCard
          key={post.id}
          post={post}
          seriesSlug={seriesSlug}
          index={index}
        />
      ))}
    </div>
  );
}
