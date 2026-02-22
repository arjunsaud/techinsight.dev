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
    blogs,
    users,
    comments,
    published,
    drafts,
    recentBlogs,
    recentComments,
  ] = await Promise.all([
    supabase.from("blogs").select("id", { count: "exact", head: true }),
    supabase.from("superadmins").select("id", { count: "exact", head: true }),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase.from("blogs").select("id", { count: "exact", head: true }).eq(
      "status",
      "published",
    ),
    supabase.from("blogs").select("id", { count: "exact", head: true }).eq(
      "status",
      "draft",
    ),
    supabase
      .from("blogs")
      .select("id,title,slug,status,created_at,published_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("comments")
      .select("id,content,created_at,blog:blogs(title),user:superadmins(username)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    stats: {
      totalBlogs: blogs.count ?? 0,
      totalUsers: users.count ?? 0,
      totalComments: comments.count ?? 0,
      publishedBlogs: published.count ?? 0,
      draftBlogs: drafts.count ?? 0,
    },
    recentBlogs: recentBlogs.data ?? [],
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
    .select("id,content,created_at,user:superadmins(username),blog:blogs(title)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
