import { requireAdmin } from "@/lib/supabase/guards";
import { SeriesPostEditor } from "@/components/series/series-post-editor";
import { seriesService } from "@/services/series-service";
import { notFound } from "next/navigation";

interface EditSeriesPostPageProps {
  params: Promise<{ id: string; postId: string }>;
}

export default async function EditSeriesPostPage({
  params,
}: EditSeriesPostPageProps) {
  const { id, postId } = await params;
  const session = await requireAdmin();
  const accessToken = session.access_token;

  let post = null;
  try {
    post = await seriesService.getPostById(id, postId, accessToken);
  } catch (error) {
    console.error("Failed to fetch series post:", error);
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SeriesPostEditor 
        seriesId={id} 
        initialPost={post} 
        accessToken={accessToken} 
      />
    </div>
  );
}
