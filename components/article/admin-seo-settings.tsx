"use client";

import { useMemo, useState } from "react";
import { Settings } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import type { Article } from "@/types/domain";
import { apiFetch } from "@/services/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetBody, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Props {
  accessToken?: string;
  articleId?: string | null;
}

const schema = z.object({
  slug: z.string().optional().transform((v) =>
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
});

type FormValues = z.infer<typeof schema>;

export function ArticleSeoSettings({ accessToken, articleId }: Props) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: "",
      seoTitle: "",
      metaDescription: "",
      keywords: "",
    },
  });

  const articleQuery = useQuery({
    queryKey: ["admin-article", articleId],
    queryFn: () => apiFetch<Article>(`article/${articleId}`, { accessToken }),
    enabled: Boolean(open && accessToken && articleId),
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
          },
        });
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      if (articleId) queryClient.invalidateQueries({ queryKey: ["admin-article", articleId] });
      toast.success("SEO settings saved");
      setOpen(false);
    },
    onError: () => toast.error("Failed to save SEO settings"),
  });

  const onOpen = () => {
    setOpen(true);
    if (articleQuery.data) {
      form.reset({
        slug: articleQuery.data.slug ?? "",
        seoTitle: articleQuery.data.seoTitle ?? "",
        metaDescription: articleQuery.data.metaDescription ?? "",
        keywords: articleQuery.data.keywords ?? "",
      });
    }
  };

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
      toast.success("SEO settings updated");
      setOpen(false);
      return;
    }
    mutation.mutate(values);
  });

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" aria-label="Open SEO Settings" onClick={onOpen}>
        <Settings className="h-4 w-4" />
      </Button>

      <Sheet open={open} onClose={() => setOpen(false)} side="right">
        <SheetHeader>
          <SheetTitle>SEO Settings</SheetTitle>
          <button
            className="rounded p-2 text-gray-500 hover:bg-gray-100"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </SheetHeader>
        <form onSubmit={onSubmit}>
          <SheetBody>
            {articleQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    {...form.register("slug")}
                    onChange={(e) => form.setValue("slug", schema.shape.slug.parse(e.target.value))}
                    placeholder="post-slug"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SEO Title</label>
                  <Input {...form.register("seoTitle")} placeholder="30–60 characters" />
                  <div className={analysis.titleOk ? "text-xs text-green-600" : "text-xs text-amber-600"}>
                    {analysis.titleLen}/60
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta Description</label>
                  <Textarea
                    {...form.register("metaDescription")}
                    placeholder="70–160 characters"
                    className="min-h-[120px]"
                  />
                  <div className={analysis.metaOk ? "text-xs text-green-600" : "text-xs text-amber-600"}>
                    {analysis.metaLen}/160
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Keywords</label>
                  <Input {...form.register("keywords")} placeholder="comma,separated,keywords" />
                  <div className={analysis.kwOk ? "text-xs text-green-600" : "text-xs text-amber-600"}>
                    {analysis.kwCount} keywords
                  </div>
                </div>
              </>
            )}
          </SheetBody>
          <SheetFooter>
            <Button variant="outline" size="sm" type="button" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </SheetFooter>
        </form>
      </Sheet>
    </div>
  );
}
