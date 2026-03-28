import { Metadata } from "next";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { SeriesCard } from "@/components/article/series-card";
import {
  getCategories,
  getRecommendedArticles,
  getSeries,
  getTags,
} from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Series – TechInsight",
  description: "Explore our curated series of articles, tutorials, and structured learning paths.",
};

export default async function SeriesListPage() {
  const [seriesList, categories, tags, recommendedArticles] = await Promise.all([
    getSeries(),
    getCategories(),
    getTags(),
    getRecommendedArticles(),
  ]);

  return (
    <PublicPageLayout
      categories={categories}
      tags={tags}
      recommendedArticles={recommendedArticles}
      title="Article Series"
      description="Curated collections of related stories and tutorials."
    >
      <div className="flex flex-col">
        {seriesList.map((series) => (
          <SeriesCard key={series.id} series={series} />
        ))}
      </div>
    </PublicPageLayout>
  );
}
