import Link from "next/link";
import { SidebarCategories } from "@/components/article/sidebar-categories";
import { RecommendedArticles } from "@/components/article/recommended-articles";
import { SidebarTags } from "@/components/article/sidebar-tags";
import type { Article, Category, Tag } from "@/types/domain";

interface PublicSidebarProps {
  categories: Category[];
  tags?: Tag[];
  recommendedArticles: Article[];
  className?: string;
  activeCategoryId?: string;
  activeTagSlug?: string;
}

export function PublicSidebar({
  categories,
  tags = [],
  recommendedArticles,
  className,
  activeCategoryId,
  activeTagSlug,
}: PublicSidebarProps) {
  return (
    <aside className={className}>
      <div className="sticky top-24 space-y-10">
        {/* Recommended Categories */}
        <SidebarCategories
          categories={categories}
          activeCategoryId={activeCategoryId}
        />

        <hr className="border-border" />

        {/* Recommended Articles */}
        <RecommendedArticles articles={recommendedArticles} />

        <hr className="border-border" />

        {/* Trending Tags */}
        {tags.length > 0 && (
          <>
            <SidebarTags tags={tags} activeTagSlug={activeTagSlug} />
            <hr className="border-border" />
          </>
        )}

        {/* Newsletter / CTA Placeholder */}
        <div className="rounded-2xl bg-muted p-6">
          <h4 className="font-serif text-lg font-bold text-foreground">
            Stay updated.
          </h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the TechInsight community to get the best stories in your
            inbox.
          </p>
          <button className="mt-4 w-full rounded-full bg-primary py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">
            Subscribe
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-8 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
          <p className="mt-6">
            © {new Date().getFullYear()} TechInsight. Stories worth reading.
          </p>
        </div>
      </div>
    </aside>
  );
}
