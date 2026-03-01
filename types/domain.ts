export type Role = "superadmin" | "admin" | "user";
export type ArticleStatus = "draft" | "published";

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
  description?: string | null;
  color?: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  content: string;
  excerpt: string | null;
  category_id: string | null;
  featured_image_url: string | null;
  status: ArticleStatus;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  tags?: Tag[];
}

export interface Comment {
  id: string;
  article_id: string;
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
  article?: { title?: string | null } | null;
}

export interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalComments: number;
  publishedArticles: number;
  draftArticles: number;
}
