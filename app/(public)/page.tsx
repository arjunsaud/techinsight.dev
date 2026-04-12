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
  title: "TechInsight",
  description: "Discover the latest insights, tutorials, and news from the world of tech.",
  alternates: { canonical: "/" },
};

interface ArticleIndexPageProps {
  searchParams: Promise<{ featured?: string }>;
}

import { Pagination } from "@/components/ui/pagination";

export default async function ArticleIndexPage({
  searchParams,
}: ArticleIndexPageProps) {
  const resolvedParams = await searchParams;
  const isFeatured = resolvedParams?.featured === "true";
  const page = parseInt(resolvedParams?.page || "1", 10);
  const pageSize = 12;

  const [articlesResponse, categories, tags, recommendedArticles] = await Promise.all([
    getPublishedArticles({ isFeatured: isFeatured ? true : undefined, page, pageSize }),
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
      <ArticleList articles={articlesResponse.data} />
      <Pagination 
        page={page} 
        pageSize={pageSize} 
        total={articlesResponse.total} 
        className="mt-12 justify-center border-t pt-8" 
      />
    </PublicPageLayout>
  );
}
