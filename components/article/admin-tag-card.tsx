import * as React from "react";
import { Trash2, Hash } from "lucide-react";

export function TagCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-sm group">
      <div className="flex items-center gap-4 min-w-0 flex-1">{children}</div>
    </div>
  );
}

TagCard.Icon = function TagCardIcon() {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <Hash className="h-5 w-5" />
    </div>
  );
};

TagCard.Header = function TagCardHeader({
  name,
  articleCount,
}: {
  name: string;
  articleCount: number;
}) {
  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[15px] font-semibold text-foreground truncate">
        {name}
      </span>
      <span className="text-xs text-muted-foreground">
        {articleCount} {articleCount === 1 ? "article" : "articles"}
      </span>
    </div>
  );
};

TagCard.Delete = function TagCardDelete({
  onDelete,
}: {
  onDelete: () => void;
}) {
  return (
    <button
      onClick={onDelete}
      className="ml-auto shrink-0 rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      aria-label="Delete tag"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
};
