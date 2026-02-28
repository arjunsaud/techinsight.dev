import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export async function getUserRoleModel(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase.from("superadmins").select("role").eq(
    "id",
    userId,
  ).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.role ?? null;
}

export async function getDashboardModel(supabase: SupabaseClient) {
  const [
    articles,
    users,
    comments,
    published,
    drafts,
    recentArticles,
    recentComments,
  ] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("superadmins").select("id", { count: "exact", head: true }),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq(
      "status",
      "published",
    ),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq(
      "status",
      "draft",
    ),
    supabase
      .from("articles")
      .select("id,title,slug,status,created_at,published_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("comments")
      .select("id,content,created_at,article:articles(title),user:superadmins(username)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    stats: {
      totalArticles: articles.count ?? 0,
      totalUsers: users.count ?? 0,
      totalComments: comments.count ?? 0,
      publishedArticles: published.count ?? 0,
      draftArticles: drafts.count ?? 0,
    },
    recentArticles: recentArticles.data ?? [],
    recentComments: recentComments.data ?? [],
  };
}

export async function listUsersModel(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("superadmins")
    .select("id,email,username,role,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function listCommentsModel(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("comments")
    .select("id,content,created_at,user:superadmins(username),article:articles(title)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
