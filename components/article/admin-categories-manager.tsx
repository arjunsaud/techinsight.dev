"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Folder, Pencil, Trash2, Plus } from "lucide-react";

import type { Category } from "@/types/domain";
import { adminService } from "@/services/admin-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AdminCategoriesManagerProps {
  accessToken: string;
  initialCategories: Category[];
}

export function AdminCategoriesManager({
  accessToken,
  initialCategories,
}: AdminCategoriesManagerProps) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const schema = z.object({
    name: z.string().min(1, "Category name is required").max(80),
    description: z.string().max(200).optional(),
  });
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminService.listCategories(accessToken),
    initialData: initialCategories,
  });

  const categories = categoriesQuery.data ?? [];

  const createCategoryMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!accessToken) throw new Error("Missing admin session token.");
      return adminService.createCategory(
        values.name,
        values.description ?? null,
        accessToken,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      form.reset();
      toast.success("Category created");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create category",
      );
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      categoryId,
      values,
    }: {
      categoryId: string;
      values: Partial<FormValues>;
    }) => {
      if (!accessToken) throw new Error("Missing admin session token.");
      return adminService.updateCategory(categoryId, values, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditingId(null);
      toast.success("Category updated");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update category",
      );
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!accessToken) throw new Error("Missing admin session token.");
      return adminService.removeCategory(categoryId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category",
      );
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createCategoryMutation.mutate(values);
  });

  return (
    <div className="space-y-8">
      {/* Add Category Section */}
      <div className="rounded-xl w-1/2 border bg-card p-6 shadow-sm">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 w-full space-y-4">
              <div className="flex gap-4 items-start">
                <Input
                  placeholder="Category name..."
                  className="h-11 shadow-none bg-background"
                  {...form.register("name")}
                />
              </div>
              <Input
                placeholder="Short description (optional)"
                className="h-11 shadow-none bg-background"
                {...form.register("description")}
              />
              <Button
                type="submit"
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                disabled={createCategoryMutation.isPending}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-card/50">
            No categories found. Create one above to get started.
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Folder className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        category.color || "bg-blue-500",
                      )}
                    />
                    <h3 className="font-semibold text-foreground truncate">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {category.description || "No description provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-6">
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none px-3 py-1 font-medium"
                >
                  0 articles
                </Badge>
                <code className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  /{category.slug}
                </code>
                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => setEditingId(category.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (globalThis.confirm("Delete this category?")) {
                        deleteCategoryMutation.mutate(category.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
