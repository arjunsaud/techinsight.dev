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
  title = "Recommended Categories",
}: SidebarCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold tracking-widest text-gray-900">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategoryId === cat.id
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-foreground"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
