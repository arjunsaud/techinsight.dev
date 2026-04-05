import { SeriesPostStudio } from "@/components/series/series-post-studio";
import { SeriesPostStudioProvider } from "@/components/series/series-post-studio-context";
import { SeriesPostHeaderControls } from "@/components/series/series-post-header-controls";
import { SeriesPostSettings } from "@/components/series/series-post-settings";
import { AdminHeader } from "@/components/layout/admin.header";
import { requireAdmin } from "@/lib/supabase/guards";
import { seriesService } from "@/services/series-service";

interface NewSeriesPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewSeriesPostPage({
  params,
}: NewSeriesPostPageProps) {
  const { id } = await params;
  const session = await requireAdmin();
  const accessToken = session.access_token;

  const series = await seriesService.getById(id, accessToken);

  return (
    <SeriesPostStudioProvider>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <AdminHeader
            title="New Series Article"
            description={`Writing in ${series?.title || 'series'}`}
            showBack={true}
            backUrl={`/admin/series/${id}`}
          />
          <div className="flex items-center gap-2">
            <SeriesPostHeaderControls />
            <SeriesPostSettings
              accessToken={accessToken}
              seriesId={id}
            />
          </div>
        </div>
        <SeriesPostStudio
          seriesId={id}
          accessToken={accessToken}
        />
      </section>
    </SeriesPostStudioProvider>
  );
}
