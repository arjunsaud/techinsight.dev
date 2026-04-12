import { Metadata } from "next";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { SeriesCard } from "@/components/article/series-card";
import { Pagination } from "@/components/ui/pagination";
import {
  getCategories,
  getRecommendedArticles,
  getSeries,
  getTags,
} from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Series – TechInsight",
  description:
    "Explore our curated series of articles, tutorials, and structured learning paths.",
};

export default async function SeriesListPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const page = parseInt(
    typeof resolvedParams.page === "string" ? resolvedParams.page : "1",
    10,
  );
  const pageSize = 12;

  const [seriesResponse, categories, tags, recommendedArticles] =
    await Promise.all([
      getSeries({ page, pageSize }),
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
        {seriesResponse.data.map((series) => (
          <SeriesCard key={series.id} series={series} />
        ))}
      </div>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={seriesResponse.total}
        className="mt-12 justify-center border-t pt-8"
      />
    </PublicPageLayout>
  );
}
