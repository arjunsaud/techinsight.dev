"use client";

import Link from "next/link";
import { Edit2, Trash2, BookOpen, Layers } from "lucide-react";
import { Series } from "@/types/domain";
import { cn } from "@/lib/utils";

interface SeriesCardProps {
  series: Series;
  onDelete: (id: string) => void;
}

export function SeriesCard({ series, onDelete }: SeriesCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-blue-100 hover:shadow-md hover:-translate-y-1">
      {/* Invisible Link Overlay for the whole card */}
      <Link 
        href={`/admin/series/${series.id}`} 
        className="absolute inset-0 z-0"
        aria-label={`View ${series.title}`}
      />
      
      <div className="relative z-10 flex items-start justify-between pointer-events-none">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 transition-colors group-hover:bg-blue-100">
            {series.coverImage ? (
              <img
                src={series.coverImage}
                alt={series.title}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <Layers className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1">
            <Link
              href={`/admin/series/${series.id}`}
              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors pointer-events-auto"
            >
              {series.title}
            </Link>
            <p className="text-sm font-medium text-gray-400">/{series.slug}</p>
          </div>
        </div>

        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-auto">
          <Link
            href={`/admin/series/${series.id}`}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="Edit Series Metadata"
          >
            <Edit2 className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onDelete(series.id)}
            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete Series"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-gray-500">
          {series.description || "No description provided."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
          <BookOpen className="h-3 w-3" />
          {series.postsCount || 0} articles
        </div>
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
            series.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          )}
        >
          {series.status}
        </span>
      </div>
    </div>
  );
}
