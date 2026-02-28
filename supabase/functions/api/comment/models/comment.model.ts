import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

type CommentRow = {
  id: string;
  article_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  user: { id: string; username: string | null } | null;
};

function nest(rows: CommentRow[]) {
  const map = new Map<string, CommentRow & { children: CommentRow[] }>();
  const roots: Array<CommentRow & { children: CommentRow[] }> = [];

  rows.forEach((row) => {
    map.set(row.id, { ...row, children: [] });
  });

  for (const row of map.values()) {
    if (row.parent_id && map.has(row.parent_id)) {
      map.get(row.parent_id)?.children.push(row);
    } else {
      roots.push(row);
    }
  }

  return roots;
}

export async function listCommentsByArticleModel(
  supabase: SupabaseClient,
  articleId: string,
) {
  const { data, error } = await supabase
    .from("comments")
    .select(
      "id,article_id,user_id,parent_id,content,created_at,user:superadmins(id,username)",
    )
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return nest((data ?? []) as CommentRow[]);
}

export async function createCommentModel(
  supabase: SupabaseClient,
  payload: {
    articleId: string;
    userId: string;
    content: string;
    parentId?: string;
  },
) {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      article_id: payload.articleId,
      user_id: payload.userId,
      parent_id: payload.parentId ?? null,
      content: payload.content,
    })
    .select(
      "id,article_id,user_id,parent_id,content,created_at,user:superadmins(id,username)",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCommentModel(
  supabase: SupabaseClient,
  commentId: string,
) {
  const { error } = await supabase.from("comments").delete().eq(
    "id",
    commentId,
  );

  if (error) {
    throw new Error(error.message);
  }
}
