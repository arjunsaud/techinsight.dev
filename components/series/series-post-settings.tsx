"use client";

import { useMemo, useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  showToc: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface SeriesPostSettingsProps {
  initialValues: {
    slug: string;
    seoTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string | null;
    showToc: boolean;
  };
  onChange: (values: Partial<FormValues>) => void;
}

export function SeriesPostSettings({ initialValues, onChange }: SeriesPostSettingsProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: initialValues.slug || "",
      seoTitle: initialValues.seoTitle || "",
      metaDescription: initialValues.metaDescription || "",
      keywords: initialValues.keywords || "",
      showToc: initialValues.showToc || false,
    },
  });

  // Keep form in sync with initialValues if they change externally (like title->slug)
  useEffect(() => {
    form.reset({
      slug: initialValues.slug || "",
      seoTitle: initialValues.seoTitle || "",
      metaDescription: initialValues.metaDescription || "",
      keywords: initialValues.keywords || "",
      showToc: initialValues.showToc || false,
    });
  }, [initialValues, form]);

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
    
    return { titleLen, metaLen, kwCount, titleOk, metaOk, kwOk };
  }, [form.watch()]);

  const onSubmit = form.handleSubmit((values) => {
    onChange(values);
    setOpen(false);
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="rounded-xl border-gray-100 bg-white shadow-sm"
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>

      <Sheet open={open} onClose={() => setOpen(false)} side="right">
        <SheetHeader>
          <SheetTitle>Article Settings</SheetTitle>
          <button
            className="rounded p-2 text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </SheetHeader>
        
        <form onSubmit={onSubmit} className="flex flex-1 flex-col overflow-hidden">
          <SheetBody className="space-y-6 pb-8">
            <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold text-foreground">SEO & Meta</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Slug</label>
                <Input
                  {...form.register("slug")}
                  placeholder="article-slug"
                  className="h-11 shadow-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SEO Title</label>
                <Input
                  {...form.register("seoTitle")}
                  placeholder="30–60 characters recommended"
                  className="h-11 shadow-none"
                />
                <div className={analysis.titleOk ? "text-xs text-green-600 font-medium" : "text-xs text-amber-600"}>
                  {analysis.titleLen}/60
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Meta Description</label>
                <Textarea
                  {...form.register("metaDescription")}
                  placeholder="Brief summary for search results"
                  className="min-h-[100px] shadow-none"
                />
                <div className={analysis.metaOk ? "text-xs text-green-600 font-medium" : "text-xs text-amber-600"}>
                  {analysis.metaLen}/160
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Keywords</label>
                <Input
                  {...form.register("keywords")}
                  placeholder="React, Nextjs, AI..."
                  className="h-11 shadow-none"
                />
                <div className={analysis.kwOk ? "text-xs text-green-600 font-medium" : "text-xs text-amber-600"}>
                  {analysis.kwCount} keywords detected
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold text-foreground">Features</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Table of Contents</label>
                  <p className="text-xs text-muted-foreground">Show TOC on post page</p>
                </div>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...form.register("showToc")}
                />
              </div>
            </div>
          </SheetBody>

          <SheetFooter className="border-t bg-background/80 backdrop-blur-md">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 px-6 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold"
            >
              Apply Settings
            </Button>
          </SheetFooter>
        </form>
      </Sheet>
    </>
  );
}
