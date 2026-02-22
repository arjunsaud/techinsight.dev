export interface BlogPayload {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  tagIds?: string[];
  featuredImageUrl?: string;
  status: "draft" | "published";
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export interface BlogListFilters {
  page: number;
  pageSize: number;
  status: string | null;
  queryText: string | null;
  isAdmin: boolean;
}

export interface CloudinarySettings {
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
}
