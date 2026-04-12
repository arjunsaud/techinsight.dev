"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { SeriesForm } from "@/components/series/series-form";
import { SeriesArticlesManager } from "@/components/series/series-articles-manager";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Series, SeriesPost } from "@/types/domain";

interface SeriesDetailViewProps {
  series: Series;
  accessToken: string;
}

export function SeriesDetailView({
  series,
  accessToken,
}: SeriesDetailViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(series);

  const handleUpdateSuccess = (updated: Series) => {
    setCurrentSeries(updated as any);
    setIsSidebarOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <AdminHeader
          title={`Manage Series: ${currentSeries.title}`}
          description="Manage article sequence and series settings."
          showBack={true}
          backUrl="/admin/series"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(true)}
          className="shrink-0 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Settings2 className="h-4 w-4" />
          Settings
        </Button>
      </div>

      <div className="w-full">
        <SeriesArticlesManager
          seriesId={currentSeries.id}
          initialPosts={currentSeries.posts || []}
          initialTotal={currentSeries.postsTotal || 0}
          initialPage={currentSeries.postsPage || 1}
          accessToken={accessToken}
        />
      </div>

      <Sheet open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <SheetHeader>
          <SheetTitle>Series Settings</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <div>
            <SeriesForm
              initialSeries={currentSeries}
              accessToken={accessToken}
              onSuccess={handleUpdateSuccess}
            />
          </div>
        </SheetBody>
      </Sheet>
    </div>
  );
}
