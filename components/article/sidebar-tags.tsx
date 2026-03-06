import React from "react";
import Link from "next/link";
import { Tag } from "@/types/domain";
import { Badge } from "@/components/ui/badge";

interface SidebarTagsProps {
  tags: Tag[];
  activeTagSlug?: string;
}

export function SidebarTags({ tags, activeTagSlug }: SidebarTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">
        Trending Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            <Badge
              variant={activeTagSlug === tag.slug ? "default" : "secondary"}
              className={`cursor-pointer transition-all hover:scale-105 ${
                activeTagSlug === tag.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              #{tag.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
