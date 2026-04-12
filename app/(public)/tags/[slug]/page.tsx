import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/article/article-list";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import {
  getCategories,
  getPublishedArticles,
  getRecommendedArticles,
  getTags,
} from "@/lib/server-data";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tags = await getTags();
  const tag = tags.find((t) => t.slug === slug);

  if (!tag) {
    return { title: "Tag not found" };
  }

  const title = `#${tag.name} – TechInsight`;
  const description = `Articles and insights tagged with ${tag.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/tags/${tag.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/tags/${tag.slug}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;

  const [categories, tags, recommendedArticles] = await Promise.all([
    getCategories(),
    getTags(),
    getRecommendedArticles(),
  ]);

  const tag = tags.find((t) => t.slug === slug);

  if (!tag) {
    notFound();
  }

  const articlesResponse = await getPublishedArticles({ tag: tag.slug });

  return (
    <PublicPageLayout
      categories={categories}
      tags={tags}
      recommendedArticles={recommendedArticles}
      activeTagSlug={tag.slug}
      title={`#${tag.name}`}
      description={`Articles and insights tagged with ${tag.name}.`}
      showBackToHub={true}
    >
      <ArticleList articles={articlesResponse.data} />
    </PublicPageLayout>
  );
}
