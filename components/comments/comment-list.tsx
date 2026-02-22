import type { Comment } from "@/types/domain";
import { formatDate } from "@/lib/utils";

interface CommentListProps {
  comments: Comment[];
  depth?: number;
}

function CommentItem({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  return (
    <article className="space-y-2 rounded-md border bg-card p-4">
      <header className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{comment.user?.username ?? "User"}</span>
        <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
      </header>
      <p className="text-sm leading-6">{comment.content}</p>
      {comment.children && comment.children.length > 0 ? (
        <div className="space-y-3 border-l pl-4">
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
