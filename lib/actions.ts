"use server";

import { revalidateTag, revalidatePath } from "next/cache";

export async function revalidateArticle(slug?: string) {
  // Revalidate by path for immediate effect
  revalidatePath("/articles", "page");
  revalidatePath("/", "page");
  if (slug) {
    revalidatePath(`/articles/${slug}`, "page");
    revalidatePath(`/${slug}`, "page");
  }
}

export async function revalidateGlobal() {
  revalidatePath("/", "layout");
}
