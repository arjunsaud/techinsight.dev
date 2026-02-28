"use client";

import { Bookmark, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Article } from "@/types/domain";
import { createExcerpt, formatDate } from "@/lib/utils";

function estimateReadTime(content: string): number {
  const wordCount = content
    .replace(/<[^>]+>/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const excerpt = article.excerpt ?? createExcerpt(article.content, 150);
  const readTime = estimateReadTime(article.content);
  const date = formatDate(article.published_at ?? article.created_at);
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group mb-3 flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md sm:gap-6 sm:p-5"
    >
      {/* Text */}
      <div className="min-w-0 flex-1">
        {/* Category */}
        {article.category ? (
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-green-700">
            {article.category.name}
          </span>
        ) : (
          <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-400">
            Uncategorized
          </span>
        )}
        <h3
          className="line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-gray-600 sm:text-lg"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500 sm:text-sm">
          {excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
            <span>{date}</span>
            <span aria-hidden>·</span>
            <span>{readTime} min read</span>
            {(article.tags ?? []).length > 0 ? (
              <>
                <span aria-hidden>·</span>
                <div className="flex flex-wrap gap-1">
                  {article.tags?.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <span aria-hidden>·</span>
                <span className="text-[10px] italic text-gray-300">
                  no tags
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="text-gray-400 transition-colors hover:text-red-500"
              title="Like"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="text-gray-400 transition-colors hover:text-blue-600"
              title="Bookmark"
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail — visible from xs up, size adapts */}
      {article.featured_image_url ? (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-24">
          <Image
            src={article.featured_image_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 sm:h-20 sm:w-24" />
      )}
    </Link>
  );
}
