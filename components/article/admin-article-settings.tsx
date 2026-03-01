"use client";

import { useMemo, useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import type { Article } from "@/types/domain";
import { apiFetch } from "@/services/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import { adminService } from "@/services/admin-service";

interface Props {
  accessToken?: string;
  articleId?: string | null;
}

const schema = z.object({
  slug: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 120),
    ),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

export function ArticleSettings({ accessToken, articleId }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: "",
      seoTitle: "",
      metaDescription: "",
      keywords: "",
      categoryId: "",
      tagIds: [],
    },
  });

  const articleQuery = useQuery({
    queryKey: ["admin-article", articleId],
    queryFn: () => apiFetch<Article>(`article/${articleId}`, { accessToken }),
    enabled: Boolean(open && accessToken && articleId),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminService.listCategories(accessToken),
    enabled: Boolean(open && accessToken),
  });

  const tagsQuery = useQuery({
    queryKey: ["admin-tags"],
    queryFn: () => adminService.listTags(accessToken),
    enabled: Boolean(open && accessToken),
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (articleId && accessToken) {
        return apiFetch<Article>(`article/${articleId}`, {
          method: "PATCH",
          accessToken,
          body: {
            slug: values.slug || null,
            seoTitle: values.seoTitle || null,
            metaDescription: values.metaDescription || null,
            keywords: values.keywords || null,
            categoryId: values.categoryId || null,
            tagIds: values.tagIds,
          },
        });
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      if (articleId)
        queryClient.invalidateQueries({
          queryKey: ["admin-article", articleId],
        });
      toast.success("Settings saved");
      setOpen(false);
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const onOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (articleQuery.data && open) {
      form.reset({
        slug: articleQuery.data.slug ?? "",
        seoTitle: articleQuery.data.seoTitle ?? "",
        metaDescription: articleQuery.data.metaDescription ?? "",
        keywords: articleQuery.data.keywords ?? "",
        categoryId: articleQuery.data.category_id ?? "",
        tagIds: articleQuery.data.tags?.map((t) => t.id) ?? [],
      });
    }
  }, [articleQuery.data, open, form]);

  const analysis = useMemo(() => {
    const values = form.getValues();
    const titleLen = (values.seoTitle ?? "").trim().length;
    const metaLen = (values.metaDescription ?? "").trim().length;
    const kwCount = (values.keywords ?? "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean).length;
    const titleOk = titleLen >= 30 && titleLen <= 60;
    const metaOk = metaLen >= 70 && metaLen <= 160;
    const kwOk = kwCount > 0;
    const score = [titleOk, metaOk, kwOk].filter(Boolean).length;
    return { titleLen, metaLen, kwCount, titleOk, metaOk, kwOk, score };
  }, [form.watch()]);

  const onSubmit = form.handleSubmit((values) => {
    if (!articleId || !accessToken) {
      toast.success("Settings updated");
      setOpen(false);
      return;
    }
    mutation.mutate(values);
  });

  const categories = categoriesQuery.data ?? [];
  const tags = tagsQuery.data ?? [];

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        aria-label="Open Settings"
        onClick={onOpen}
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Sheet open={open} onClose={() => setOpen(false)} side="right">
        <SheetHeader>
          <SheetTitle>Article Settings</SheetTitle>
          <button
            className="rounded p-2 text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </SheetHeader>
        <form onSubmit={onSubmit}>
          <SheetBody className="space-y-6 pb-20 custom-scrollbar">
            {articleQuery.isLoading ? (
              <div className="flex animate-pulse flex-col gap-4">
                <div className="h-10 w-full rounded bg-muted" />
                <div className="h-10 w-full rounded bg-muted" />
                <div className="h-32 w-full rounded bg-muted" />
              </div>
            ) : (
              <>
                <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Organization
                  </h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Controller
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <SearchableSelect
                          options={categories.map((c) => ({
                            id: c.id,
                            name: c.name,
                          }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select category..."
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <Controller
                      control={form.control}
                      name="tagIds"
                      render={({ field }) => (
                        <SearchableMultiSelect
                          options={tags.map((t) => ({
                            id: t.id,
                            name: t.name,
                          }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Add tags..."
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    SEO & Meta
                  </h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                      {...form.register("slug")}
                      onChange={(e) =>
                        form.setValue(
                          "slug",
                          schema.shape.slug.parse(e.target.value),
                        )
                      }
                      placeholder="post-slug"
                      className="h-11 shadow-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SEO Title</label>
                    <Input
                      {...form.register("seoTitle")}
                      placeholder="30–60 characters"
                      className="h-11 shadow-none"
                    />
                    <div
                      className={
                        analysis.titleOk
                          ? "text-xs text-green-600 font-medium"
                          : "text-xs text-amber-600"
                      }
                    >
                      {analysis.titleLen}/60
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Meta Description
                    </label>
                    <Textarea
                      {...form.register("metaDescription")}
                      placeholder="70–160 characters"
                      className="min-h-[100px] shadow-none"
                    />
                    <div
                      className={
                        analysis.metaOk
                          ? "text-xs text-green-600 font-medium"
                          : "text-xs text-amber-600"
                      }
                    >
                      {analysis.metaLen}/160
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Keywords</label>
                    <Input
                      {...form.register("keywords")}
                      placeholder="comma,separated,keywords"
                      className="h-11 shadow-none"
                    />
                    <div
                      className={
                        analysis.kwOk
                          ? "text-xs text-green-600 font-medium"
                          : "text-xs text-amber-600"
                      }
                    >
                      {analysis.kwCount} keywords
                    </div>
                  </div>
                </div>
              </>
            )}
          </SheetBody>
          <SheetFooter className="border-t bg-background/80 backdrop-blur-md">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
              className="h-10 px-6"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={mutation.isPending}
              className="h-10 px-8 bg-blue-600 hover:bg-blue-700"
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </Sheet>
    </div>
  );
}
