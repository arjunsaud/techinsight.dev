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

        <hr className="border-gray-100" />

        {/* Recommended Articles */}
        <RecommendedArticles articles={recommendedArticles} />

        <hr className="border-gray-100" />

        {/* Trending Tags */}
        {tags.length > 0 && (
          <>
            <SidebarTags tags={tags} activeTagSlug={activeTagSlug} />
            <hr className="border-gray-100" />
          </>
        )}

        {/* Newsletter / CTA Placeholder */}
        <div className="rounded-2xl bg-gray-50 p-6">
          <h4 className="font-serif text-lg font-bold text-gray-900">
            Stay updated.
          </h4>
          <p className="mt-2 text-sm text-gray-500">
            Join the TechInsight community to get the best stories in your
            inbox.
          </p>
          <button className="mt-4 w-full rounded-full bg-primary py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">
            Subscribe
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-8 text-xs text-gray-400">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="#" className="hover:text-gray-600">
              Help
            </Link>
            <Link href="#" className="hover:text-gray-600">
              Status
            </Link>
            <Link href="#" className="hover:text-gray-600">
              About
            </Link>
            <Link href="#" className="hover:text-gray-600">
              Careers
            </Link>
            <Link href="#" className="hover:text-gray-600">
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
