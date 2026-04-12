import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export async function getUserRoleModel(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("superadmins")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

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
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("articles")
      .select(
        "id,title,slug,status,createdAt:created_at,publishedAt:published_at",
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("comments")
      .select(
        "id,content,createdAt:created_at,article:articles(title),user:superadmins(username)",
      )
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

export async function listUsersModel(
  supabase: SupabaseClient,
  page = 1,
  pageSize = 50,
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("superadmins")
    .select("id,email,username,role,createdAt:created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
  };
}

export async function listCommentsModel(
  supabase: SupabaseClient,
  page = 1,
  pageSize = 50,
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("comments")
    .select(
      "id,content,createdAt:created_at,user:superadmins(username),article:articles(title)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
  };
}
