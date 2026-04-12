import Link from "next/link";
import type { Category } from "@/types/domain";

interface SidebarCategoriesProps {
  categories: Category[];
  activeCategoryId?: string;
  title?: string;
}

export function SidebarCategories({
  categories,
  activeCategoryId,
  title = "Recommended Topics",
}: SidebarCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold tracking-widest text-foreground">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {categories.slice(0, 6).map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategoryId === cat.id
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-muted font-medium"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
