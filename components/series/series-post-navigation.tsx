import Link from "next/link";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { PostSeriesInfo } from "@/types/domain";
import { cn } from "@/lib/utils";

interface SeriesPostNavigationProps {
  info: PostSeriesInfo;
  seriesSlug: string;
}

export function SeriesPostNavigation({
  info,
  seriesSlug,
}: SeriesPostNavigationProps) {
  return (
    <div className="my-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm ring-1 ring-border">
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
        {/* Previous */}
        <div className="flex-1 p-4">
          {info.prevPost ? (
            <Link
              href={`/series/${seriesSlug}/${info.prevPost.slug}` as any}
              className="group flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                <ChevronLeft className="h-4 w-4" />
                Previous Episode
              </div>
              <div className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {info.prevPost.title}
              </div>
            </Link>
          ) : (
            <div className="flex flex-col gap-1 opacity-30">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
                <ChevronLeft className="h-4 w-4" />
                Previous Episode
              </div>
              <div className="font-bold text-foreground">No previous episode</div>
            </div>
          )}
        </div>

        {/* Series Info / Index */}
        <div className="flex shrink-0 flex-col items-center justify-center p-4 bg-muted/30">
          <Link
            href={`/series/${seriesSlug}` as any}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <List className="h-4 w-4" />
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Episode {info.index} of {info.totalInSeries}
              </div>
              <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                View Series
              </div>
            </div>
          </Link>
        </div>

        {/* Next */}
        <div className="flex-1 p-4 text-right">
          {info.nextPost ? (
            <Link
              href={`/series/${seriesSlug}/${info.nextPost.slug}` as any}
              className="group flex flex-col items-center sm:items-end gap-1"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                Next Episode
                <ChevronRight className="h-4 w-4" />
              </div>
              <div className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {info.nextPost.title}
              </div>
            </Link>
          ) : (
            <div className="flex flex-col items-center sm:items-end gap-1 opacity-30">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
                Next Episode
                <ChevronRight className="h-4 w-4" />
              </div>
              <div className="font-bold text-foreground">End of Series</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
