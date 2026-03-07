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

type ArticleStatus = "draft" | "published";

export interface ArticleFilterInput {
  query?: string;
  category?: string | null;
  tag?: string | null;
  isFeatured?: boolean | null;
  status?: ArticleStatus | null;
  page?: number;
  pageSize?: number;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  tagIds: string[];
  featuredImageUrl?: string | null;
  status: ArticleStatus;
  isFeatured?: boolean;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
  showToc?: boolean;
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
