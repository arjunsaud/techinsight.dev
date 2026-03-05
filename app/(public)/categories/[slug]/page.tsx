import { notFound } from "next/navigation";
import Link from "next/link";

import { ArticleList } from "@/components/article/article-list";
import { PublicSidebar } from "@/components/layout/public-sidebar";
import { getCategories, getPublishedArticles } from "@/lib/server-data";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [categories, articles] = await Promise.all([
    getCategories(),
    getPublishedArticles(),
  ]);

  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const filteredArticles = articles.filter(
    (article) => article.category?.slug === category.slug,
  );

  const recommendedArticles = articles.slice(0, 4);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 md:py-10">
        <div className="flex flex-col gap-0 md:flex-row lg:gap-12">
          {/* LEFT COLUMN: Categories (Desktop Only) */}
          <aside className="hidden shrink-0 lg:block lg:w-[20%]">
            <div className="sticky top-24">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-gray-900">
                Topics
              </h3>
              <nav className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all hover:bg-gray-50 hover:text-gray-900 ${
                      category.id === cat.id
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

          {/* MIDDLE COLUMN: Article Feed */}
          <main className="w-full md:w-[70%] lg:w-[55%] md:border-r md:border-gray-100 md:pr-10 lg:pr-0 lg:border-r-0">
            <section className="space-y-6">
              <header className="border-b pb-6">
                <h1
                  className="text-4xl font-bold tracking-tight"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {category.name}
                </h1>
                {category.description && (
                  <p className="mt-4 text-lg text-gray-600">
                    {category.description}
                  </p>
                )}
              </header>
              <ArticleList articles={filteredArticles} />
            </section>
          </main>

          <PublicSidebar
            categories={categories}
            recommendedArticles={recommendedArticles}
            activeCategoryId={category.id}
            className="hidden md:block md:w-[30%] md:pl-10 lg:w-[25%] lg:pl-0"
          />
        </div>
      </div>
    </div>
  );
}
