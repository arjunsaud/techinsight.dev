import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PublicPageLayout } from "@/components/layout/public-page-layout";
import { PublicSeriesPostList } from "@/components/series/public-series-post-list";
import {
  getCategories,
  getRecommendedArticles,
  getSeriesBySlug,
  getTags,
} from "@/lib/server-data";
import { Pagination } from "@/components/ui/pagination";

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) {
    return { title: "Series not found" };
  }

  const title = `${series.title} – TechInsight`;
  const description =
    series.description ?? `Explore all articles in the ${series.title} series.`;

  return {
    title,
    description,
    alternates: { canonical: `/series/${series.slug}` },
  };
}

export default async function SeriesDetailPage({
  params,
  searchParams,
}: SeriesPageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1", 10);
  const pageSize = 12;

  const [series, categories, tags, recommendedArticles] = await Promise.all([
    getSeriesBySlug(slug, true, { page, pageSize }),
    getCategories(),
    getTags(),
    getRecommendedArticles(),
  ]);

  if (!series) {
    notFound();
  }

  return (
    <PublicPageLayout
      categories={categories}
      tags={tags}
      recommendedArticles={recommendedArticles}
      showBackToHub={true}
      title={series.title}
      description={series.description ?? undefined}
    >
      <div className="flex flex-col space-y-12">
        {series.coverImage && (
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl bg-muted shadow-sm ring-1 ring-border">
            <Image
              src={series.coverImage}
              alt={series.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Series Curriculum
            </h2>
            <span className="text-sm font-medium text-muted-foreground">
              {series.postsTotal || 0} Articles
            </span>
          </div>

          <PublicSeriesPostList
            posts={series.posts || []}
            seriesSlug={series.slug}
          />

          <Pagination
            total={series.postsTotal || 0}
            page={page}
            pageSize={pageSize}
            className="mt-8 border-t pt-8"
          />
        </div>
      </div>
    </PublicPageLayout>
  );
}
