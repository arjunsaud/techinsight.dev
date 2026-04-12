"use client";

import Image from "next/image";
import Link from "next/link";
import { SeriesPost } from "@/types/domain";
import { createExcerpt, formatDate } from "@/lib/utils";

interface PublicSeriesPostCardProps {
  post: SeriesPost;
  seriesSlug: string;
  index: number;
}

function estimateReadTime(content: string): number {
  const wordCount = content
    .replace(/<[^>]+>/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function PublicSeriesPostCard({ post, seriesSlug, index }: PublicSeriesPostCardProps) {
  const excerpt = post.excerpt ?? createExcerpt(post.content, 150);
  const readTime = estimateReadTime(post.content);
  const date = formatDate(post.publishedAt ?? post.createdAt);

  return (
    <Link
      href={`/series/${seriesSlug}/${post.slug}` as any}
      className="group mb-4 flex items-start gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-primary/20 sm:gap-6"
    >
      {/* Index Badge */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        {index + 1}
      </div>

      <div className="min-w-0 flex-1">
        <h3
          className="line-clamp-2 text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-xl"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
          {excerpt}
        </p>
        
        <div className="mt-4 flex items-center gap-3 text-xs font-medium text-muted-foreground/60">
          <span>{date}</span>
          <span aria-hidden>·</span>
          <span>{readTime} min read</span>
        </div>
      </div>

      {post.featuredImageUrl && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-32">
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
    </Link>
  );
}
