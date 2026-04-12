import { SeriesPostStudio } from "@/components/series/series-post-studio";
import { SeriesPostStudioProvider } from "@/components/series/series-post-studio-context";
import { SeriesPostHeaderControls } from "@/components/series/series-post-header-controls";
import { SeriesPostSettings } from "@/components/series/series-post-settings";
import { AdminHeader } from "@/components/layout/admin-header";
import { requireAdmin } from "@/lib/supabase/guards";
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
  let series = null;
  try {
    [post, series] = await Promise.all([
      seriesService.getPostById(id, postId, accessToken),
      seriesService.getById(id, accessToken),
    ]);
  } catch (error) {
    console.error("Failed to fetch series post:", error);
  }

  if (!post) {
    notFound();
  }

  return (
    <SeriesPostStudioProvider>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <AdminHeader
            title="Edit Series Article"
            description={`Editing in ${series?.title || 'series'}`}
            showBack={true}
            backUrl={`/admin/series/${id}`}
          />
          <div className="flex items-center gap-2">
            <SeriesPostHeaderControls />
            <SeriesPostSettings
              accessToken={accessToken}
              seriesId={id}
              postId={postId}
              initialData={{
                slug: post.slug,
                seoTitle: post.seoTitle,
                metaDescription: post.metaDescription,
                keywords: post.keywords,
                showToc: post.showToc,
              }}
            />
          </div>
        </div>
        <SeriesPostStudio
          seriesId={id}
          accessToken={accessToken}
          initialPost={post}
        />
      </section>
    </SeriesPostStudioProvider>
  );
}
