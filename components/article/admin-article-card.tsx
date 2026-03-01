import * as React from "react";
import Link from "next/link";
import {
  Edit,
  ExternalLink,
  MessageSquare,
  MoreHorizontal,
  Trash,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ArticleCardContextValue {
  id: string;
  slug: string;
}

const ArticleCardContext = React.createContext<
  ArticleCardContextValue | undefined
>(undefined);

function useArticleCardContext() {
  const context = React.useContext(ArticleCardContext);
  if (!context) {
    throw new Error(
      "ArticleCard compound components must be rendered within the ArticleCard component",
    );
  }
  return context;
}

export function ArticleCard({
  id,
  slug,
  children,
}: {
  id: string;
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <ArticleCardContext.Provider value={{ id, slug }}>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-xl border bg-card p-4 sm:p-6 transition-colors hover:bg-muted/50">
        {children}
      </div>
    </ArticleCardContext.Provider>
  );
}

ArticleCard.Image = function ArticleCardImage({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  if (!src) {
    return (
      <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-lg bg-muted object-cover text-xs text-muted-foreground">
        No Image
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-24 w-36 shrink-0 rounded-lg object-cover border"
    />
  );
};

ArticleCard.Content = function ArticleCardContent({
  title,
  excerpt,
  status,
  tags = [],
  views = 0,
  likes = 0,
  comments = 0,
  readTime = "5m",
}: {
  title: string;
  excerpt: string | null;
  status: string;
  tags?: string[];
  views?: number;
  likes?: number;
  comments?: number;
  readTime?: string;
}) {
  return (
    <div className="flex flex-1 flex-col justify-between overflow-hidden">
      <div>
        <h3 className="truncate text-base font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {excerpt || "No description provided."}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={status === "published" ? "default" : "secondary"}
            className="rounded-md font-medium capitalize"
          >
            {status}
          </Badge>
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-md bg-muted font-normal text-muted-foreground hover:bg-muted/80"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>
              {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{readTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

ArticleCard.Actions = function ArticleCardActions({
  onDelete,
}: {
  onDelete: () => void;
}) {
  const { id, slug } = useArticleCardContext();

  return (
    <div className="flex shrink-0 items-start justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link
              href={`/admin/articles?edit=${id}`}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href={`/articles/${slug}`}
              className="cursor-pointer"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>View Live</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            onClick={onDelete}
          >
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
