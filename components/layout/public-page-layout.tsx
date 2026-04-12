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
    <div className="bg-background text-foreground transition-colors duration-300">
      {categories.length > 0 && (
        <div className="border-b border-border lg:hidden">
          <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 py-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/articles"
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                !activeCategoryId && !activeTagSlug
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          <aside className="hidden shrink-0 lg:block lg:w-[15%]">
            <div className="sticky top-24">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-foreground">
                All Topics
              </h3>
              <nav className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      activeCategoryId === cat.id
                        ? "bg-muted text-foreground font-bold"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* MIDDLE COLUMN: Main Content */}
          <main className="w-full md:w-[70%] lg:w-[62%] md:border-r md:border-border md:pr-10 lg:pr-0 lg:border-r-0">
            {(title || description) && (
              <header className="mb-8 border-b border-border pb-6">
                {title && (
                  <h1
                    className="text-4xl font-bold tracking-tight text-foreground"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-4 text-lg text-muted-foreground">
                    {description}
                  </p>
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
            className="hidden md:block md:w-[30%] md:pl-10 lg:w-[23%] lg:pl-0"
          />
        </div>
      </div>
    </div>
  );
}
