import * as React from "react";
import {
  Heart,
  MoreHorizontal,
  Reply,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentCardContextValue {
  id: string;
}

const CommentCardContext = React.createContext<
  CommentCardContextValue | undefined
>(undefined);

function useCommentCardContext() {
  const context = React.useContext(CommentCardContext);
  if (!context) {
    throw new Error(
      "CommentCard compound components must be rendered within CommentCard",
    );
  }
  return context;
}

export function CommentCard({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <CommentCardContext.Provider value={{ id }}>
      <div className="flex gap-4 rounded-xl border bg-card p-4 sm:p-6 transition-colors hover:bg-muted/50">
        {children}
      </div>
    </CommentCardContext.Provider>
  );
}

CommentCard.Avatar = function CommentCardAvatar({
  fallback,
}: {
  fallback: string;
}) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
      {fallback}
    </div>
  );
};

CommentCard.Content = function CommentCardContent({
  authorName,
  status,
  date,
  content,
  articleTitle,
  likes = 0,
  replies = 0,
  onApprove,
  onSpam,
}: {
  authorName: string;
  status: "approved" | "pending" | "spam";
  date: string;
  content: string;
  articleTitle: string;
  likes?: number;
  replies?: number;
  onApprove?: () => void;
  onSpam?: () => void;
}) {
  const getBadgeVariant = (s: string) => {
    switch (s) {
      case "approved":
        return "default";
      case "pending":
        return "outline";
      case "spam":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">{authorName}</span>
          <Badge
            variant={getBadgeVariant(status)}
            className="capitalize rounded-md"
          >
            {status}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">{date}</span>
      </div>

      <div className="mt-2 text-sm text-foreground">{content}</div>

      <div className="mt-2 text-xs text-muted-foreground">
        on{" "}
        <span className="font-medium text-muted-foreground">
          {articleTitle}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            <span>{likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Reply className="h-3.5 w-3.5" />
            <span>{replies} replies</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status !== "approved" && onApprove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-normal"
              onClick={onApprove}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Approve
            </Button>
          )}
          {status !== "spam" && onSpam && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-normal text-destructive hover:text-destructive"
              onClick={onSpam}
            >
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              Spam
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                Reply
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
