export interface BlogPayload {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  tagIds?: string[];
  featuredImageUrl?: string;
  status: "draft" | "published";
}

export interface BlogListFilters {
  page: number;
  pageSize: number;
  status: string | null;
  queryText: string | null;
  isAdmin: boolean;
}

export interface R2Settings {
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET: string;
  R2_PUBLIC_URL: string;
}
