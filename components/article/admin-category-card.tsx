import * as React from "react";
import { Trash2, Folder, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-sm group">
      <div className="flex items-center gap-4 min-w-0 flex-1">{children}</div>
    </div>
  );
}

CategoryCard.Icon = function CategoryCardIcon({ color }: { color?: string | null }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 relative">
      <Folder className="h-6 w-6" />
      <div 
        className={cn(
          "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white shadow-sm",
          color || "bg-blue-500"
        )} 
      />
    </div>
  );
};

CategoryCard.Header = function CategoryCardHeader({
  name,
  description,
  slug,
  articleCount,
}: {
  name: string;
  description?: string | null;
  slug: string;
  articleCount: number;
}) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[15px] font-semibold text-foreground truncate">
        {name}
      </span>
      <span className="text-xs text-muted-foreground truncate">
        {description || "No description"}
      </span>
      <div className="mt-1 flex items-center gap-2">
        <code className="text-[10px] text-muted-foreground/50">/{slug}</code>
        <span className="text-[10px] text-blue-600/60 font-medium">
          • {articleCount} {articleCount === 1 ? "article" : "articles"}
        </span>
      </div>
    </div>
  );
};

CategoryCard.Actions = function CategoryCardActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <button
        onClick={onEdit}
        className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Edit category"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        aria-label="Delete category"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
