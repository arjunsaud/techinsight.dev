"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { seriesService } from "@/services/series-service";
import { Series } from "@/types/domain";
import { toast } from "sonner";
import { SeriesCard } from "./series-card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { SeriesForm } from "./series-form";
import { useRouter } from "next/navigation";

import { Pagination } from "@/components/ui/pagination";

interface AdminSeriesListProps {
  initialSeries: Series[];
  accessToken: string;
  page: number;
  pageSize: number;
  total: number;
}

export function AdminSeriesList({
  initialSeries,
  accessToken,
  page,
  pageSize,
  total: initialTotal,
}: AdminSeriesListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<Series | null>(null);

  const seriesQuery = useQuery({
    queryKey: ["admin-series", page, pageSize],
    queryFn: async () => {
      const response = await seriesService.list({ page, pageSize });
      return response;
    },
    initialData: page === 1 ? { data: initialSeries, total: initialTotal, page: 1, pageSize } : undefined,
    enabled: !!accessToken,
  });

  const seriesList = seriesQuery.data?.data || [];
  const currentTotal = seriesQuery.data?.total || initialTotal;

  const deleteSeriesMutation = useMutation({
    mutationFn: (id: string) => seriesService.delete(id, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-series"] });
      toast.success("Series deleted successfully");
      setSeriesToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete series");
    },
  });

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
            className="pl-10 h-11"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 sm:w-auto h-11"
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

      <ConfirmModal
        isOpen={!!seriesToDelete}
        onClose={() => setSeriesToDelete(null)}
        onConfirm={() => seriesToDelete && deleteSeriesMutation.mutate(seriesToDelete.id)}
        title="Delete Series"
        description={`Are you sure you want to delete "${seriesToDelete?.title}"? Standalone articles within it will also be deleted.`}
        isLoading={deleteSeriesMutation.isPending}
      />

      {filteredSeries.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredSeries.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
                onDelete={() => setSeriesToDelete(series)}
              />
            ))}
          </div>
          <Pagination total={currentTotal} page={page} pageSize={pageSize} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-100 py-24 text-center bg-card/50">
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
