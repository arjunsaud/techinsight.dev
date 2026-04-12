import { SeriesDetailView } from "@/components/series/series-detail-view";
import { requireAdmin } from "@/lib/supabase/guards";
import { seriesService } from "@/services/series-service";
import { notFound } from "next/navigation";

interface AdminSeriesEditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminSeriesEditPage({
  params,
  searchParams,
}: AdminSeriesEditPageProps) {
  const { id } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1", 10);
  const session = await requireAdmin();
  const accessToken = session.access_token;

  let series = null;
  try {
    series = await seriesService.getById(id, accessToken, { page });
  } catch (error) {
    console.error("Failed to fetch series:", error);
  }

  if (!series) {
    notFound();
  }

  return <SeriesDetailView series={series} accessToken={accessToken} />;
}
