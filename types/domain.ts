export type Role = "superadmin" | "admin" | "user";
export type ArticleStatus = "draft" | "published";

export interface AppUser {
  id: string;
  email: string;
  username: string | null;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
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
  categoryId: string | null;
  featuredImageUrl: string | null;
  status: ArticleStatus;
  authorId: string;
  showToc: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  tags?: Tag[];
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  user?: Pick<AppUser, "id" | "username">;
  children?: Comment[];
}

export interface AdminComment {
  id: string;
  content: string;
  createdAt: string;
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
