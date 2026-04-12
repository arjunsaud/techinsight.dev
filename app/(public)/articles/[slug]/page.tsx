import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Image from "next/image";

import { PublicSidebar } from "@/components/layout/public-sidebar";

import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { Badge } from "@/components/ui/badge";
import { TableOfContents } from "@/components/article/toc";
import {
  getArticleBySlug,
  getCategories,
  getCommentsByArticle,
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

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found",
    };
  }

  const title = article.seoTitle ?? article.title;
  const description =
    article.metaDescription ??
    article.excerpt ??
    stripHtml(article.content).slice(0, 160);
  const images = article.featuredImageUrl
    ? [{ url: article.featuredImageUrl, alt: article.title ?? title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/articles/${article.slug}`,
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

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params;

  const [article, categories, tags, recommendedArticles, seriesInfo] =
    await Promise.all([
      getArticleBySlug(slug),
      getCategories() as Promise<Category[]>,
      getTags() as Promise<Tag[]>,
      getRecommendedArticles(),
      getPostSeriesInfo(slug),
    ]);

  if (!article) {
    notFound();
  }

  const comments = await getCommentsByArticle(article.id);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.seoTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt ?? undefined,
    image: article.featuredImageUrl ?? undefined,
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt ?? undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/articles/${article.slug}`,
    },
    keywords: article.keywords ?? undefined,
  };

  return (
    <div className="bg-background text-foreground transition-colors duration-300">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Mobile/Tablet categories strip */}
      {categories.length > 0 && (
        <div className="border-b border-border lg:hidden">
          <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 py-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/articles"
              className="whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-sm"
            >
              For you
            </Link>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 md:py-10">
        <div className="flex flex-col gap-0 md:flex-row lg:gap-12">
          {/* LEFT COLUMN: Categories (Desktop Only) */}
          <aside className="hidden shrink-0 lg:block lg:w-[15%]">
            <div className="sticky top-24">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">
                All Topics
              </h3>
              <nav className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:bg-muted hover:text-foreground ${
                        article.category?.id === cat.id
                          ? "bg-muted text-foreground font-bold"
                          : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
              </nav>
            </div>
          </aside>

          {/* MIDDLE COLUMN: Article Content */}
          <main className="w-full md:w-[70%] lg:w-[62%] md:border-r md:border-border md:pr-10 lg:pr-0 lg:border-r-0">
            <article className="mx-auto max-w-3xl space-y-8">
              <header className="space-y-4 border-b border-border pb-6">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {article.category ? (
                    <Link href={`/categories/${article.category.slug}`}>
                      <Badge className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
                        {article.category.name}
                      </Badge>
                    </Link>
                  ) : null}
                  <span>
                    {formatDate(article.publishedAt ?? article.createdAt)}
                  </span>
                </div>

                {seriesInfo?.inSeries && (
                  <Link
                    href={`/series/${seriesInfo.series?.slug}`}
                    className="group block rounded-xl bg-card p-4 border border-border transition-all hover:border-primary/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          Part {seriesInfo.index} of {seriesInfo.totalInSeries}{" "}
                          in Series
                        </span>
                        <h4 className="font-serif text-base font-bold text-foreground group-hover:text-primary">
                          {seriesInfo.series?.title}
                        </h4>
                      </div>
                      <span className="text-primary transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </Link>
                )}

                <h1
                  className="text-4xl font-bold tracking-tight text-foreground sm:text-4xl md:text-4xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {article.title}
                </h1>
                {article.excerpt ? (
                  <p className="text-lg text-muted-foreground">
                    {article.excerpt}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {(article.tags ?? []).map((tag) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`}>
                      <Badge className="cursor-pointer bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </header>

              {article.featuredImageUrl ? (
                <figure className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                  <Image
                    src={article.featuredImageUrl}
                    alt={article.title || "Article featured image"}
                    width={1400}
                    height={750}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </figure>
              ) : null}

              {article.showToc && <TableOfContents content={article.content} />}

              <section
                className="hashnode-render-content prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: injectHeadingIds(article.content),
                }}
              />

              {seriesInfo?.inSeries && (
                <div className="grid grid-cols-1 gap-4 pt-10 border-t sm:grid-cols-2">
                  {seriesInfo.prevPost ? (
                    <Link
                      href={`/articles/${seriesInfo.prevPost.slug}`}
                      className="group flex flex-col items-start rounded-2xl border border-border p-6 transition-all hover:border-primary/50 hover:bg-card/50"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary">
                        ← Previous Part
                      </span>
                      <span className="mt-2 font-serif text-base font-bold text-foreground group-hover:text-primary">
                        {seriesInfo.prevPost.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="hidden sm:block" />
                  )}

                  {seriesInfo.nextPost ? (
                    <Link
                      href={`/articles/${seriesInfo.nextPost.slug}`}
                      className="group flex flex-col items-end rounded-2xl border border-border p-6 text-right transition-all hover:border-primary/50 hover:bg-card/50"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary">
                        Next Part →
                      </span>
                      <span className="mt-2 font-serif text-base font-bold text-foreground group-hover:text-primary">
                        {seriesInfo.nextPost.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                      End of Series
                    </div>
                  )}
                </div>
              )}

              <section className="space-y-6 border-t border-border pt-10">
                <h2 className="text-2xl font-semibold text-foreground">
                  Comments
                </h2>
                <CommentForm articleId={article.id} />
                <CommentList comments={comments} />
              </section>
            </article>
          </main>

          <PublicSidebar
            categories={categories}
            tags={tags}
            recommendedArticles={recommendedArticles}
            activeCategoryId={article.category?.id}
            className="hidden md:block md:w-[30%] md:pl-10 lg:w-[23%] lg:pl-0"
          />
        </div>
      </div>
    </div>
  );
}
