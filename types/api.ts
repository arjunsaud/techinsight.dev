import type { AdminComment, Blog, Category, Comment, DashboardStats, Tag } from "@/types/domain";

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface BlogFilterInput {
  query?: string;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
  status?: "draft" | "published";
}

export interface CreateBlogInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  tagIds: string[];
  featuredImageUrl?: string;
  status: "draft" | "published";
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {
  id: string;
}

export interface CreateCommentInput {
  blogId: string;
  content: string;
  parentId?: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentBlogs: Blog[];
  recentComments: AdminComment[];
}

export interface TaxonomyResponse {
  categories: Category[];
  tags: Tag[];
}
