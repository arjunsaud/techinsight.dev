import { ArticleList } from "@/components/article/article-list";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import {
  getCategories,
  getPublishedArticles,
  getRecommendedArticles,
  getTags,
} from "@/lib/server-data";

interface ArticleIndexPageProps {
  searchParams: Promise<{ featured?: string }>;
}

export default async function ArticleIndexPage({
  searchParams,
}: ArticleIndexPageProps) {
  const { featured } = await searchParams;
  const isFeatured = featured === "true";

  const [articles, categories, tags, recommendedArticles] = await Promise.all([
    getPublishedArticles(isFeatured ? { featured: true } : {}),
    getCategories(),
    getTags(),
    getRecommendedArticles(),
  ]);

  return (
    <PublicPageLayout
      categories={categories}
      tags={tags}
      recommendedArticles={recommendedArticles}
      title={isFeatured ? "Featured Stories" : "Latest Stories"}
      description={
        isFeatured
          ? "The most impactful stories and insights from our community."
          : "Discover the latest insights, tutorials, and news from the world of tech."
      }
    >
      <ArticleList articles={articles} />
    </PublicPageLayout>
  );
}
