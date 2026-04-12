import type { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return { title: "Category not found" };
  }

  const title = `${category.name} – TechInsight`;
  const description =
    category.description ?? `Articles and insights in ${category.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/categories/${category.slug}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
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

  const articlesResponse = await getPublishedArticles({ category: category.slug });

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
      <ArticleList articles={articlesResponse.data} />
    </PublicPageLayout>
  );
}
