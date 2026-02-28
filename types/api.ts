import type {
  AdminComment,
  Article,
  Category,
  Comment,
  DashboardStats,
  Tag,
} from "@/types/domain";

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ArticleFilterInput {
  query?: string;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
  status?: "draft" | "published";
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  tagIds: string[];
  featuredImageUrl?: string;
  status: "draft" | "published";
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
  id: string;
}

export interface CreateCommentInput {
  articleId: string;
  content: string;
  parentId?: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentArticles: Article[];
  recentComments: AdminComment[];
}

export interface TaxonomyResponse {
  categories: Category[];
  tags: Tag[];
}
