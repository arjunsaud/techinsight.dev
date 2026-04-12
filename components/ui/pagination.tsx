"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePageChange = (newPage: number) => {
    if (newPage === page || newPage < 1 || newPage > totalPages) return;

    if (onPageChange) {
      onPageChange(newPage);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage === 1) {
        params.delete("page");
      } else {
        params.set("page", newPage.toString());
      }
      router.push(`${pathname}?${params.toString()}` as any);
    }
  };



  // Generate page numbers
  const renderPages = () => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="1" pageNumber={1} isActive={page === 1} onClick={() => handlePageChange(1)} />
      );
      if (startPage > 2) {
        pages.push(<PaginationEllipsis key="ellipsis-start" />);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i} pageNumber={i} isActive={page === i} onClick={() => handlePageChange(i)} />
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<PaginationEllipsis key="ellipsis-end" />);
      }
      pages.push(
        <PaginationItem
          key={totalPages}
          pageNumber={totalPages}
          isActive={page === totalPages}
          onClick={() => handlePageChange(totalPages)}
        />
      );
    }

    return pages;
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4 w-full py-4", className)} {...props}>
      <div className="text-sm text-muted-foreground flex-shrink-0">
        Showing <strong>{total === 0 ? 0 : (page - 1) * pageSize + 1}</strong> to{" "}
        <strong>{Math.min(page * pageSize, total)}</strong> of <strong>{total}</strong> results
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Previous</span>
        </button>
        
        <div className="hidden sm:flex items-center space-x-1">
          {renderPages()}
        </div>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}

function PaginationItem({
  pageNumber,
  isActive,
  onClick,
}: {
  pageNumber: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "bg-transparent text-foreground border border-transparent"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {pageNumber}
    </button>
  );
}

function PaginationEllipsis() {
  return (
    <span className="flex h-9 w-9 items-center justify-center">
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
