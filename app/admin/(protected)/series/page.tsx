import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSeriesList } from "@/components/series/admin-series-list";
import { requireAdmin } from "@/lib/supabase/guards";
import { seriesService } from "@/services/series-service";
import { Series } from "@/types/domain";
import { PaginatedResponse } from "@/types/api";

export default async function AdminSeriesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdmin();
  const accessToken = session.access_token;

  const resolvedParams = searchParams ? await searchParams : {};
  const page = parseInt(typeof resolvedParams.page === "string" ? resolvedParams.page : "1", 10);
  const pageSize = 10;

  let seriesResponse: PaginatedResponse<Series> = { data: [], page, pageSize, total: 0 };
  try {
    seriesResponse = await seriesService.list({ cache: "no-store", page, pageSize });
  } catch (error) {
    console.error("Failed to fetch series:", error);
  }

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Series Management"
        description="Create and manage article series, tutorials, and structured learning paths."
      />
      
      <AdminSeriesList 
        initialSeries={Array.isArray(seriesResponse) ? seriesResponse : seriesResponse.data || []} 
        accessToken={accessToken}
        page={seriesResponse.page || 1}
        pageSize={seriesResponse.pageSize || 10}
        total={seriesResponse.total || (Array.isArray(seriesResponse) ? seriesResponse.length : 0)}
      />
    </section>
  );
}
