export type Role = "superadmin" | "admin" | "user";
export type BlogStatus = "draft" | "published";

export interface AppUser {
  id: string;
  email: string;
  username: string | null;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  seo_title: string | null;
  content: string;
  excerpt: string | null;
  category_id: string | null;
  featured_image_url: string | null;
  status: BlogStatus;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  tags?: Tag[];
}

export interface Comment {
  id: string;
  blog_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  user?: Pick<AppUser, "id" | "username">;
  children?: Comment[];
}

export interface AdminComment {
  id: string;
  content: string;
  created_at: string;
  user?: { id?: string; username?: string | null } | null;
  blog?: { title?: string | null } | null;
}

export interface DashboardStats {
  totalBlogs: number;
  totalUsers: number;
  totalComments: number;
  publishedBlogs: number;
  draftBlogs: number;
}
