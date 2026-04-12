import type { MetadataRoute } from "next";

import { getCategories, getPublishedArticles, getTags } from "@/lib/server-data";
import type { Article, Category, Tag } from "@/types/domain";

export const dynamic = "force-dynamic";

function toValidDate(input: string | null | undefined): Date | undefined {
  if (!input) return undefined;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/articles`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  let articles: Article[] = [];
  let categories: Category[] = [];
  let tags: Tag[] = [];

  try {
    const [articlesResponse, cat, t] = await Promise.all([
      getPublishedArticles({ pageSize: 1000 }),
      getCategories(),
      getTags(),
    ]);
    articles = articlesResponse.data;
    categories = cat;
    tags = t;
  } catch {
    // If env vars are missing (e.g., local build without Supabase configured),
    // still serve a valid sitemap with static URLs.
  }

  const articleUrls: MetadataRoute.Sitemap = articles
    .filter((a) => !!a.slug)
    .map((a) => ({
      url: `${siteUrl}/articles/${a.slug}`,
      ...(toValidDate(a.publishedAt ?? a.updatedAt ?? a.createdAt)
        ? { lastModified: toValidDate(a.publishedAt ?? a.updatedAt ?? a.createdAt) }
        : {}),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter((c) => !!c.slug)
    .map((c) => ({
      url: `${siteUrl}/categories/${c.slug}`,
      ...(toValidDate(c.createdAt)
        ? { lastModified: toValidDate(c.createdAt) }
        : {}),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  const tagUrls: MetadataRoute.Sitemap = tags
    .filter((t) => !!t.slug)
    .map((t) => ({
      url: `${siteUrl}/tags/${t.slug}`,
      ...(toValidDate(t.createdAt)
        ? { lastModified: toValidDate(t.createdAt) }
        : {}),
      changeFrequency: "weekly",
      priority: 0.4,
    }));

  return [...staticUrls, ...articleUrls, ...categoryUrls, ...tagUrls];
}

