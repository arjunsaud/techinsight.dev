"use client";

import Image from "next/image";
import Link from "next/link";
import { Layers } from "lucide-react";
import type { Series } from "@/types/domain";

interface SeriesCardProps {
  series: Series;
}

export function SeriesCard({ series }: SeriesCardProps) {
  return (
    <Link
      href={`/series/${series.slug}`}
      className="group mb-5 flex items-stretch gap-6 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg sm:p-6"
    >
      {/* Meta Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary">
          <Layers className="h-3 w-3" />
          <span>Article Series</span>
        </div>

        <h3
          className="line-clamp-2 text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {series.title}
        </h3>

        {series.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground sm:text-base">
            {series.description}
          </p>
        )}

        <div className="mt-6 flex items-center gap-2 text-sm font-bold text-primary">
          Explore Series
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative hidden w-32 shrink-0 overflow-hidden rounded-xl bg-muted xs:block sm:w-48 md:w-56">
        {series.coverImage ? (
          <Image
            src={series.coverImage}
            alt={series.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <Layers className="h-10 w-10" />
          </div>
        )}
      </div>
    </Link>
  );
}
