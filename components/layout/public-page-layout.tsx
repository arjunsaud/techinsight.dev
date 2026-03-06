import React from "react";
import Link from "next/link";
import { Category, Article, Tag } from "@/types/domain";
import { PublicSidebar } from "./public-sidebar";

interface PublicPageLayoutProps {
  children: React.ReactNode;
  categories: Category[];
  tags?: Tag[];
  recommendedArticles: Article[];
  activeCategoryId?: string;
  activeTagSlug?: string;
  title?: string;
  description?: string;
  showBackToHub?: boolean;
}

export function PublicPageLayout({
  children,
  categories,
  tags = [],
  recommendedArticles,
  activeCategoryId,
  activeTagSlug,
  title,
  description,
  showBackToHub = false,
}: PublicPageLayoutProps) {
  return (
    <div className="bg-white">
      {/* Mobile/Tablet Topics Strip */}
      {categories.length > 0 && (
        <div className="border-b border-gray-100 lg:hidden">
          <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 py-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/articles"
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                !activeCategoryId && !activeTagSlug
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              For you
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  activeCategoryId === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
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
                {showBackToHub && (
                  <Link
                    href="/"
                    className="mb-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900"
                  >
                    ← Back to Hub
                  </Link>
                )}

                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      activeCategoryId === cat.id
                        ? "bg-gray-50 text-gray-900 font-bold"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* MIDDLE COLUMN: Main Content */}
          <main className="w-full md:w-[70%] lg:w-[55%] md:border-r md:border-gray-100 md:pr-10 lg:pr-0 lg:border-r-0">
            {(title || description) && (
              <header className="mb-8 border-b pb-6">
                {title && (
                  <h1
                    className="text-4xl font-bold tracking-tight text-gray-900"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-4 text-lg text-gray-600">{description}</p>
                )}
              </header>
            )}
            {children}
          </main>

          {/* RIGHT COLUMN: Sidebar */}
          <PublicSidebar
            categories={categories}
            tags={tags}
            recommendedArticles={recommendedArticles}
            activeCategoryId={activeCategoryId}
            activeTagSlug={activeTagSlug}
            className="hidden md:block md:w-[30%] md:pl-10 lg:w-[25%] lg:pl-0"
          />
        </div>
      </div>
    </div>
  );
}
