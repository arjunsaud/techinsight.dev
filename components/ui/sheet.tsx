"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left";
  children: React.ReactNode;
  className?: string;
}

export function Sheet({
  open,
  onClose,
  side = "right",
  children,
  className,
}: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div
        className="fixed inset-0 bg-black/40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative h-full w-full max-w-[420px] bg-white shadow-xl flex flex-col transition-transform animate-in slide-in-from-right duration-300",
          side === "right" ? "ml-auto" : "mr-auto",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b p-4",
        className,
      )}
      {...props}
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function SheetBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto space-y-4 p-4 custom-scrollbar",
        className,
      )}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t p-4",
        className,
      )}
      {...props}
    />
  );
}
