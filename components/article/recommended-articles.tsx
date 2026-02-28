import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types/domain";

interface RecommendedArticlesProps {
  articles: Article[];
  title?: string;
}

export function RecommendedArticles({
  articles,
  title = "Recommended Stories",
}: RecommendedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold tracking-widest text-gray-900">
        {title}
      </h3>
      <div className="flex flex-col gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group flex items-start gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {article.category && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-green-700">
                    {article.category.name}
                  </span>
                )}
                <span className="text-[10px] text-gray-400">
                  {formatDate(article.published_at ?? article.created_at)}
                </span>
              </div>
              <h4 className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-gray-600 font-serif">
                {article.title}
              </h4>
            </div>
            {article.featured_image_url && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={article.featured_image_url}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
