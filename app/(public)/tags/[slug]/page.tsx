import { notFound } from "next/navigation";

import { ArticleList } from "@/components/article/article-list";
import { getPublishedArticles, getTags } from "@/lib/server-data";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const [tags, articles] = await Promise.all([getTags(), getPublishedArticles()]);

  const tag = tags.find((item) => item.slug === slug);

  if (!tag) {
    notFound();
  }

  const filteredArticles = articles.filter((article) =>
    article.tags?.some((articleTag) => articleTag.slug === tag.slug),
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
        <ArticleList articles={filteredArticles} />
      </section>
    </div>
  );
}
