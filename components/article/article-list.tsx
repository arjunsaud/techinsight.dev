import type { Article } from "@/types/domain";
import { ArticleCard } from "@/components/article/article-card";

interface ArticleListProps {
  articles: Article[];
}

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-base text-gray-400">
          No published stories yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
