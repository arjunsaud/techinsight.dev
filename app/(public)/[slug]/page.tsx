import { redirect } from "next/navigation";

interface LegacyArticleRouteProps {
  params: Promise<{ slug: string }>;
}

// Legacy route kept only for backwards compatibility.
// Redirect to the canonical article URL to avoid duplicate content in search engines.
export default async function LegacyArticleRoute({
  params,
}: LegacyArticleRouteProps) {
  const { slug } = await params;
  redirect(`/articles/${slug}`);
}
