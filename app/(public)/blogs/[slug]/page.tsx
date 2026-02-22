import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecommendedBlogs } from "@/components/blog/recommended-blogs";

import { CommentForm } from "@/components/comments/comment-form";
import { CommentList } from "@/components/comments/comment-list";
import { Badge } from "@/components/ui/badge";
import {
  getBlogBySlug,
  getCategories,
  getCommentsByBlog,
  getPublishedBlogs,
  getTags,
} from "@/lib/server-data";
import { formatDate } from "@/lib/utils";
import type { Blog, Category, Tag } from "@/types/domain";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog not found",
    };
  }

  return {
    title: blog.title,
    description: blog.excerpt ?? undefined,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  const [blog, categories, tags, allBlogs] = await Promise.all([
    getBlogBySlug(slug),
    getCategories() as Promise<Category[]>,
    getTags() as Promise<Tag[]>,
    getPublishedBlogs() as Promise<Blog[]>,
  ]);

  if (!blog) {
    notFound();
  }

  const recommendedBlogs = allBlogs.filter((b) => b.id !== blog.id).slice(0, 4);

  const comments = await getCommentsByBlog(blog.id);

  return (
    <div className="bg-white">
      {/* Mobile/Tablet categories strip */}
      {categories.length > 0 && (
        <div className="border-b border-gray-100 lg:hidden">
          <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 py-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/blogs"
              className="whitespace-nowrap rounded-full bg-gray-900 px-4 py-1.5 text-xs font-medium text-white"
            >
              For you
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
          <aside className="hidden shrink-0 lg:block lg:w-[20%]">
            <div className="sticky top-24">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-900">
                Topics
              </h3>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/blogs"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900"
                >
                  Back to Hub
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 hover:text-gray-900 ${
                      blog.category?.id === cat.id
                        ? "bg-gray-50 text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* MIDDLE COLUMN: Blog Content */}
          <main className="w-full md:w-[70%] lg:w-[55%] md:border-r md:border-gray-100 md:pr-10 lg:pr-0 lg:border-r-0">
            <article className="mx-auto max-w-3xl space-y-8">
              <header className="space-y-4 border-b pb-6">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {blog.category ? (
                    <Link href={`/categories/${blog.category.slug}`}>
                      <Badge className="cursor-pointer transition-colors hover:bg-primary/90">
                        {blog.category.name}
                      </Badge>
                    </Link>
                  ) : null}
                  <span>
                    {formatDate(blog.published_at ?? blog.created_at)}
                  </span>
                </div>
                <h1
                  className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {blog.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {(blog.tags ?? []).map((tag) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`}>
                      <Badge className="cursor-pointer bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </header>

              <section
                className="hashnode-render-content prose max-w-none"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              <section className="space-y-6 border-t pt-10">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Comments
                </h2>
                <CommentForm blogId={blog.id} />
                <CommentList comments={comments} />
              </section>
            </article>
          </main>

          {/* RIGHT COLUMN: Sidebar (Tags & CTA) */}
          <aside className="hidden md:block md:w-[30%] md:pl-10 lg:w-[25%] lg:pl-0">
            <div className="sticky top-24 space-y-10">
              {/* Recommended Blogs */}
              <RecommendedBlogs blogs={recommendedBlogs} />

              <hr className="border-gray-100" />

              {/* Recommended Categories */}
              {categories.length > 0 && (
                <>
                  <div>
                    <h3 className="mb-4 text-sm font-bold text-gray-900">
                      Recommended Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.slug}`}
                          className="rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <hr className="border-gray-100" />
                </>
              )}

              {/* Newsletter / CTA */}
              <div className="rounded-2xl bg-gray-50 p-6">
                <h4 className="font-serif text-lg font-bold text-gray-900">
                  Enjoying this article?
                </h4>
                <p className="mt-2 text-sm text-gray-500">
                  Stay ahead with more insights like this delivered to your
                  inbox.
                </p>
                <button className="mt-4 w-full rounded-full bg-gray-900 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800">
                  Subscribe
                </button>
              </div>

              {/* Footer mini */}
              <div className="border-t border-gray-100 pt-8 text-xs text-gray-400">
                <p>
                  © {new Date().getFullYear()} TechInsight. All rights reserved.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
