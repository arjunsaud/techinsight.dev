import { notFound } from "next/navigation";

import { BlogList } from "@/components/blog/blog-list";
import { getPublishedBlogs, getTags } from "@/lib/server-data";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const [tags, blogs] = await Promise.all([getTags(), getPublishedBlogs()]);

  const tag = tags.find((item) => item.slug === slug);

  if (!tag) {
    notFound();
  }

  const filteredBlogs = blogs.filter((blog) =>
    blog.tags?.some((blogTag) => blogTag.slug === tag.slug),
  );

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10">
      <section className="space-y-6">
        <header>
          <h1
            className="font-serif text-3xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Tag: {tag.name}
          </h1>
        </header>
        <BlogList blogs={filteredBlogs} />
      </section>
    </div>
  );
}
