import type { Metadata } from "next";

import { ArticleList } from "@/components/article/article-list";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import {
  getCategories,
  getPublishedArticles,
  getRecommendedArticles,
  getTags,
} from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Articles – TechInsight",
  description: "Browse the latest insights, tutorials, and news from TechInsight.",
  alternates: { canonical: "/articles" },
};

interface ArticlesIndexPageProps {
  searchParams: Promise<{ featured?: string }>;
}

export default async function ArticlesIndexPage({
  searchParams,
}: ArticlesIndexPageProps) {
  const { featured } = await searchParams;
  const isFeatured = featured === "true";

  const [articles, categories, tags, recommendedArticles] = await Promise.all([
    getPublishedArticles(isFeatured ? { isFeatured: true } : {}),
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

