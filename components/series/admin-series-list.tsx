"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { seriesService } from "@/services/series-service";
import { Series } from "@/types/domain";
import { toast } from "sonner";
import { SeriesCard } from "./series-card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SeriesForm } from "./series-form";
import { useRouter } from "next/navigation";

interface AdminSeriesListProps {
  initialSeries: Series[];
  accessToken: string;
}

export function AdminSeriesList({
  initialSeries,
  accessToken,
}: AdminSeriesListProps) {
  const router = useRouter();
  const [seriesList, setSeriesList] = useState<Series[]>(initialSeries);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this series? Standalone articles within it will also be deleted.")) {
      return;
    }

    try {
      await seriesService.delete(id, accessToken);
      setSeriesList(seriesList.filter((s) => s.id !== id));
      toast.success("Series deleted successfully");
    } catch (error) {
      toast.error("Failed to delete series");
    }
  };

  const filteredSeries = seriesList.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Series
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Series"
      >
        <SeriesForm 
          accessToken={accessToken} 
          onSuccess={(newSeries) => {
            setIsModalOpen(false);
            router.push(`/admin/series/${newSeries.id}`);
          }}
        />
      </Modal>

      {filteredSeries.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSeries.map((series) => (
            <SeriesCard
              key={series.id}
              series={series}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-100 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">No series found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? "Try a different search term" : "Create your first series to get started"}
          </p>
        </div>
      )}
    </div>
  );
}
