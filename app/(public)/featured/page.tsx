import { ArticleList } from "@/components/article/article-list";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import {
  getCategories,
  getPublishedArticles,
  getRecommendedArticles,
  getTags,
} from "@/lib/server-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Featured Stories – TechInsight",
  description: "The most impactful stories and insights from our community.",
  alternates: { canonical: "/featured" },
};

export default async function FeaturedPage() {
  const [articles, categories, tags, recommendedArticles] = await Promise.all([
    getPublishedArticles({ isFeatured: true }),
    getCategories(),
    getTags(),
    getRecommendedArticles(),
  ]);

  return (
    <PublicPageLayout
      categories={categories}
      tags={tags}
      recommendedArticles={recommendedArticles}
      title="Featured Stories"
      description="The most impactful stories and insights from our community."
    >
      <ArticleList articles={articles} />
    </PublicPageLayout>
  );
}
