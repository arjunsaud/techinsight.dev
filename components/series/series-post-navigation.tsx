import Link from "next/link";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { PostSeriesInfo } from "@/types/domain";
import { cn } from "@/lib/utils";

interface SeriesPostNavigationProps {
  info: PostSeriesInfo;
  seriesSlug: string;
}

export function SeriesPostNavigation({ info, seriesSlug }: SeriesPostNavigationProps) {
  return (
    <div className="my-12 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100">
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {/* Previous */}
        <div className="flex-1 p-6">
          {info.prevPost ? (
            <Link
              href={`/series/${seriesSlug}/${info.prevPost.slug}` as any}
              className="group flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                <ChevronLeft className="h-4 w-4" />
                Previous Episode
              </div>
              <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {info.prevPost.title}
              </div>
            </Link>
          ) : (
            <div className="flex flex-col gap-2 opacity-30">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                <ChevronLeft className="h-4 w-4" />
                Previous Episode
              </div>
              <div className="font-bold text-gray-900">No previous episode</div>
            </div>
          )}
        </div>

        {/* Series Info / Index */}
        <div className="flex shrink-0 flex-col items-center justify-center p-6 bg-gray-50/50">
          <Link
            href={`/series/${seriesSlug}` as any}
            className="group flex flex-col items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <List className="h-5 w-5" />
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Episode {info.index} of {info.totalInSeries}
              </div>
              <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                View Series
              </div>
            </div>
          </Link>
        </div>

        {/* Next */}
        <div className="flex-1 p-6 text-right">
          {info.nextPost ? (
            <Link
              href={`/series/${seriesSlug}/${info.nextPost.slug}` as any}
              className="group flex flex-col items-center sm:items-end gap-2"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-blue-600 transition-colors">
                Next Episode
                <ChevronRight className="h-4 w-4" />
              </div>
              <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {info.nextPost.title}
              </div>
            </Link>
          ) : (
            <div className="flex flex-col items-center sm:items-end gap-2 opacity-30">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                Next Episode
                <ChevronRight className="h-4 w-4" />
              </div>
              <div className="font-bold text-gray-900">End of Series</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
