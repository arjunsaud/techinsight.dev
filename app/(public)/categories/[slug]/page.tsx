import { notFound } from "next/navigation";
import Link from "next/link";

import { ArticleList } from "@/components/article/article-list";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import {
  getCategories,
  getPublishedArticles,
  getRecommendedArticles,
  getTags,
} from "@/lib/server-data";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [categories, tags, recommendedArticles] = await Promise.all([
    getCategories(),
    getTags(),
    getRecommendedArticles(),
  ]);

  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const articles = await getPublishedArticles({ category: category.id });

  return (
    <PublicPageLayout
      categories={categories}
      tags={tags}
      recommendedArticles={recommendedArticles}
      activeCategoryId={category.id}
      title={category.name}
      description={category.description ?? undefined}
      showBackToHub={true}
    >
      <ArticleList articles={articles} />
    </PublicPageLayout>
  );
}
