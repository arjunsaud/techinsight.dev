import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { PublicSidebar } from "@/components/layout/public-sidebar";
import { SeriesPostNavigation } from "@/components/series/series-post-navigation";
import {
  getCategories,
  getSeriesPostBySlug,
  getPostSeriesInfo,
  getRecommendedArticles,
  getTags,
} from "@/lib/server-data";
import { formatDate, injectHeadingIds } from "@/lib/utils";
import type { Category, Tag } from "@/types/domain";

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface SeriesPostDetailPageProps {
  params: Promise<{ slug: string; postSlug: string }>;
}

export async function generateMetadata({
  params,
}: SeriesPostDetailPageProps): Promise<Metadata> {
  const { slug, postSlug } = await params;
  const post = await getSeriesPostBySlug(postSlug);

  if (!post) {
    return { title: "Post not found" };
  }

  const title = `${post.title} – TechInsight`;
  const description = post.excerpt ?? stripHtml(post.content).slice(0, 160);
  const images = post.featuredImageUrl
    ? [{ url: post.featuredImageUrl, alt: post.title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/series/${slug}/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/series/${slug}/${post.slug}`,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((i) => i.url),
    },
  };
}

export default async function SeriesPostDetailPage({
  params,
}: SeriesPostDetailPageProps) {
  const { slug, postSlug } = await params;

  const [post, categories, tags, recommendedArticles, seriesInfo] =
    await Promise.all([
      getSeriesPostBySlug(postSlug),
      getCategories() as Promise<Category[]>,
      getTags() as Promise<Tag[]>,
      getRecommendedArticles(),
      getPostSeriesInfo(postSlug),
    ]);

  if (!post || !seriesInfo) {
    notFound();
  }

  return (
    <div className="bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 md:py-10">
        <div className="flex flex-col gap-0 md:flex-row lg:gap-12">
          {/* LEFT COLUMN: Navigation (Desktop Only) */}
          <aside className="hidden shrink-0 lg:block lg:w-[15%]">
            <div className="sticky top-24">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">
                Series
              </h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href={`/series/${slug}`}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-foreground bg-muted transition-all hover:bg-muted/80"
                >
                  ← Back to Series
                </Link>
              </nav>
            </div>
          </aside>

          {/* MIDDLE COLUMN: Post Content */}
          <main className="w-full md:w-[70%] lg:w-[62%] md:border-r md:border-border md:pr-10 lg:pr-0 lg:border-r-0">
            <article className="mx-auto max-w-3xl space-y-8">
              <header className="space-y-4 border-b border-border pb-6">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    Episode {seriesInfo.index} of {seriesInfo.totalInSeries}
                  </div>
                  <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                </div>

                <h1
                  className="text-4xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {post.title}
                </h1>

                {post.excerpt ? (
                  <p className="text-xl text-muted-foreground leading-relaxed italic border-l-4 border-blue-500 pl-6 py-1">
                    {post.excerpt}
                  </p>
                ) : null}
              </header>

              {post.featuredImageUrl ? (
                <figure className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                  <Image
                    src={post.featuredImageUrl}
                    alt={post.title}
                    width={1400}
                    height={750}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </figure>
              ) : null}

              <section
                className="hashnode-render-content prose max-w-none prose-blue"
                dangerouslySetInnerHTML={{
                  __html: injectHeadingIds(post.content),
                }}
              />

              {/* Internal Series Navigation */}
              <SeriesPostNavigation info={seriesInfo} seriesSlug={slug} />
            </article>
          </main>

          {/* RIGHT COLUMN: Sidebar */}
          <PublicSidebar
            categories={categories}
            tags={tags}
            recommendedArticles={recommendedArticles}
            className="hidden md:block md:w-[30%] md:pl-10 lg:w-[23%] lg:pl-0"
          />
        </div>
      </div>
    </div>
  );
}
