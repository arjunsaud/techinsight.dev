import { notFound } from "next/navigation";

import { BlogList } from "@/components/blog/blog-list";
import { getCategories, getPublishedBlogs } from "@/lib/server-data";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [categories, blogs] = await Promise.all([
    getCategories(),
    getPublishedBlogs(),
  ]);

  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const filteredBlogs = blogs.filter(
    (blog) => blog.category?.slug === category.slug,
  );

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10">
      <section className="space-y-6">
        <header>
          <h1
            className="font-serif text-3xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Category: {category.name}
          </h1>
        </header>
        <BlogList blogs={filteredBlogs} />
      </section>
    </div>
  );
}
