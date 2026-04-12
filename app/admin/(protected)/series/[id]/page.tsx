import { AdminHeader } from "@/components/layout/admin-header";
import { SeriesForm } from "@/components/series/series-form";
import { SeriesArticlesManager } from "@/components/series/series-articles-manager";
import { requireAdmin } from "@/lib/supabase/guards";
import { seriesService } from "@/services/series-service";
import { notFound } from "next/navigation";

interface AdminSeriesEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSeriesEditPage({
  params,
}: AdminSeriesEditPageProps) {
  const { id } = await params;
  const session = await requireAdmin();
  const accessToken = session.access_token;

  let series = null;
  try {
    series = await seriesService.getById(id, accessToken);
  } catch (error) {
    console.error("Failed to fetch series:", error);
  }

  if (!series) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <AdminHeader
        title={`Manage Series: ${series.title}`}
        description="Edit series metadata and manage article sequence."
        showBack={true}
        backUrl="/admin/series"
      />

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SeriesArticlesManager 
            seriesId={series.id} 
            initialPosts={series.posts || []} 
            accessToken={accessToken} 
          />
        </div>
        <aside className="lg:col-span-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">
              Series Meta
            </h4>
            <SeriesForm initialSeries={series} accessToken={accessToken} />
          </div>
        </aside>
      </div>
    </section>
  );
}
