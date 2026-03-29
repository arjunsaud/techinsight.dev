"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn, formatDate } from "@/lib/utils";
import { CommentCard } from "./admin-comment-card";

interface AdminCommentsListProps {
  initialComments: any[]; // Ideally import Comment type
  filter?: string;
  accessToken: string;
}

export function AdminCommentsList({
  initialComments,
  filter = "all",
  accessToken,
}: AdminCommentsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [localFilter, setLocalFilter] = useState(filter);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalFilter(filter);
  }, [filter]);

  const handleFilterChange = (newFilter: string) => {
    setLocalFilter(newFilter);
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }

    const newSearch = params.toString();
    const currentSearch = searchParams.toString();

    if (newSearch !== currentSearch) {
      window.history.pushState(null, "", `${pathname}?${newSearch}`);
    }
  };

  const getStatus = (comment: any) => {
    // Determine status from data model or default to approved
    if (comment.is_spam) return "spam";
    if (comment.is_approved) return "approved";
    return "pending";
  };

  const allComments = initialComments.map((c) => ({
    ...c,
    status: getStatus(c),
  }));

  const approvedCount = allComments.filter(
    (c) => c.status === "approved",
  ).length;
  const pendingCount = allComments.filter((c) => c.status === "pending").length;
  const spamCount = allComments.filter((c) => c.status === "spam").length;

  const filteredComments = allComments.filter((comment) => {
    if (localFilter === "all") return true;
    return comment.status === localFilter;
  });

  const filters = [
    { id: "all", label: "All", count: allComments.length },
    { id: "approved", label: "Approved", count: approvedCount },
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "spam", label: "Spam", count: spamCount },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters Strip */}
      <div className="flex items-center rounded-md bg-muted/50 p-1 w-fit">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => handleFilterChange(f.id)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-sm transition-colors",
              localFilter === f.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Comment Cards List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            No comments found for the selected filter.
          </div>
        ) : (
          filteredComments.map((comment) => {
            const authorName =
              (comment.user as { username?: string } | null)?.username ??
              "Unknown User";
            const articleTitle =
              (comment.article as { title?: string } | null)?.title ??
              "Unknown Article";
            const initials = authorName.slice(0, 2).toUpperCase();

            return (
              <CommentCard key={comment.id} id={comment.id}>
                <CommentCard.Avatar fallback={initials} />
                <CommentCard.Content
                  authorName={authorName}
                  status={comment.status as any}
                  date={formatDate(comment.createdAt)}
                  content={comment.content}
                  articleTitle={articleTitle}
                  likes={comment.id.length * 2} // mock data to satisfy UI mapping
                  replies={0}
                  onApprove={() => console.log("Approve", comment.id)}
                  onSpam={() => console.log("Spam", comment.id)}
                />
              </CommentCard>
            );
          })
        )}
      </div>
    </div>
  );
}
