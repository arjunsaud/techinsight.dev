import { requireAdmin } from "@/lib/supabase/guards";
import { SeriesPostEditor } from "@/components/series/series-post-editor";
import { AdminHeader } from "@/components/layout/admin.header";

interface NewSeriesPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewSeriesPostPage({
  params,
}: NewSeriesPostPageProps) {
  const { id } = await params;
  const session = await requireAdmin();
  const accessToken = session.access_token;

  return (
    <div className="space-y-6">
      <SeriesPostEditor 
        seriesId={id} 
        accessToken={accessToken} 
      />
    </div>
  );
}
