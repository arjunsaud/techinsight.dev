import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSeriesList } from "@/components/series/admin-series-list";
import { requireAdmin } from "@/lib/supabase/guards";
import { seriesService } from "@/services/series-service";
import { Series } from "@/types/domain";

export default async function AdminSeriesPage() {
  const session = await requireAdmin();
  const accessToken = session.access_token;

  let series: Series[] = [];
  try {
    series = await seriesService.list({ cache: "no-store" });
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
        initialSeries={series} 
        accessToken={accessToken} 
      />
    </section>
  );
}
