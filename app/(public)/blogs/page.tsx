import Link from "next/link";

import { BlogList } from "@/components/blog/blog-list";
import { RecommendedBlogs } from "@/components/blog/recommended-blogs";
import { getCategories, getPublishedBlogs, getTags } from "@/lib/server-data";

export default async function BlogIndexPage() {
  const [blogs, categories, tags] = await Promise.all([
    getPublishedBlogs(),
    getCategories(),
    getTags(),
  ]);

  // For demonstration, use a slice of blogs for recommendations
  const recommendedBlogs = blogs.slice(0, 4);

  return (
    <div className="bg-white">
      {/* Topics strip — visible ONLY on mobile/tablet to save space */}
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

      {/* Main Container */}
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
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-all"
                >
                  All Stories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* MIDDLE COLUMN: Article Feed */}
          <main className="w-full md:w-[70%] lg:w-[55%] md:border-r md:border-gray-100 md:pr-10 lg:pr-0 lg:border-r-0">
            <div className="mb-8 block lg:hidden">
              <h2 className="text-xl font-bold text-gray-900">
                Latest Stories
              </h2>
            </div>
            <BlogList blogs={blogs} />
          </main>

          {/* RIGHT COLUMN: Tags & Meta */}
          <aside className="hidden md:block md:w-[30%] md:pl-10 lg:w-[25%] lg:pl-0">
            <div className="sticky top-24 space-y-12">
              {/* Recommended Categories */}
              {categories.length > 0 && (
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
              )}

              {/* Recommended Blogs */}
              <RecommendedBlogs blogs={recommendedBlogs} />

              {/* Newsletter / CTA Placeholder */}
              <div className="rounded-2xl bg-gray-50 p-6">
                <h4 className="font-serif text-lg font-bold text-gray-900">
                  Stay updated.
                </h4>
                <p className="mt-2 text-sm text-gray-500">
                  Join the TechInsight community to get the best stories in your
                  inbox.
                </p>
                <button className="mt-4 w-full rounded-full bg-gray-900 py-2 text-sm font-bold text-white transition-colors hover:bg-gray-800">
                  Join TechInsight
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
                  © {new Date().getFullYear()} TechInsight. Stories worth
                  reading.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
