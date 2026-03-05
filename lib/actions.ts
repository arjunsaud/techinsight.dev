"use server";

import { revalidateTag, revalidatePath } from "next/cache";

export async function revalidateArticle(slug?: string) {
  // Revalidate by tag
  revalidateTag("articles");
  if (slug) {
    revalidateTag(`article-${slug}`);
  }

  // Revalidate by path for immediate effect
  revalidatePath("/articles");
  revalidatePath("/");
  if (slug) {
    revalidatePath(`/articles/${slug}`);
    revalidatePath(`/${slug}`);
  }
}

export async function revalidateGlobal() {
  revalidateTag("categories");
  revalidateTag("tags");
  revalidateTag("articles");

  revalidatePath("/", "layout");
}
