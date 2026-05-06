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
  articles?: { count: number }[];
  series_posts?: { count: number }[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  article_tags?: { count: number }[];
  series_post_tags?: { count: number }[];
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
  viewsCount?: number;
  likesCount?: number;
  comments?: { count: number }[];
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

export interface SeriesPost {
  id: string;
  seriesId: string;
  title: string;
  slug: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  content: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  categoryId?: string | null;
  seriesOrder: number;
  status: "draft" | "published";
  showToc: boolean;
  isFeatured: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  tags?: Tag[];
  viewsCount?: number;
  likesCount?: number;
  comments?: { count: number }[];
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  posts?: SeriesPost[];
  postsCount?: number;
  postsTotal?: number;
  postsPage?: number;
  postsPageSize?: number;
}

export interface PostSeriesInfo {
  inSeries: boolean;
  series?: {
    id: string;
    title: string;
    slug: string;
  };
  seriesOrder?: number;
  totalInSeries?: number;
  index?: number;
  prevPost?: { title: string; slug: string } | null;
  nextPost?: { title: string; slug: string } | null;
}

export interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalComments: number;
  publishedArticles: number;
  draftArticles: number;
}
