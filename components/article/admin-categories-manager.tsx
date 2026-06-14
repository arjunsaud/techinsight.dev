"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Search, X } from "lucide-react";

import type { Category } from "@/types/domain";
import { adminService } from "@/services/admin-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryCard } from "@/components/article/admin-category-card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

import { Pagination } from "@/components/ui/pagination";

interface AdminCategoriesManagerProps {
  accessToken: string;
  initialCategories: Category[];
  page: number;
  pageSize: number;
  total: number;
}

const schema = z.object({
  name: z.string().min(1, "Category name is required").max(80),
  description: z.string().max(200).optional(),
});
type FormValues = z.infer<typeof schema>;

export function AdminCategoriesManager({
  accessToken,
  initialCategories,
  page,
  pageSize,
  total,
}: AdminCategoriesManagerProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", page, pageSize],
    queryFn: async () => {
      const response = await adminService.listCategories(accessToken, { page, pageSize });
      return Array.isArray(response) ? response : response.data || [];
    },
    initialData: initialCategories,
  });

  const categories = categoriesQuery.data ?? [];

  const filteredCategories = React.useMemo(() => {
    return categories.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [categories, searchTerm]);

  const createCategoryMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      console.log(values)
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
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ categoryId, values }: { categoryId: string; values: FormValues }) => {
      console.log(values)
      if (!accessToken) throw new Error("Missing admin session token.");
      return adminService.updateCategory(categoryId, values, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditingCategory(null);
      toast.success("Category updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update category");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!accessToken) throw new Error("Missing admin session token.");
      return adminService.removeCategory(categoryId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setCategoryToDelete(null);
      toast.success("Category deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createCategoryMutation.mutate(values);
  });

  const onEditSubmit = editForm.handleSubmit((values) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ categoryId: editingCategory.id, values });
    }
  });

  React.useEffect(() => {
    if (editingCategory) {
      editForm.reset({
        name: editingCategory.name,
        description: editingCategory.description || "",
      });
    }
  }, [editingCategory, editForm]);

  return (
    <div className="space-y-8">
      {/* Add Category Section */}
      <div className="rounded-xl max-w-2xl border bg-card p-6 shadow-sm">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Category name..."
                className="h-11 shadow-none bg-background"
                {...form.register("name")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Short description (optional)"
                className="h-11 shadow-none bg-background"
                {...form.register("description")}
              />
            </div>
          </div>
          <Button
            type="submit"
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={createCategoryMutation.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </form>
      </div>

      {/* Search and Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 shadow-none bg-background"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-card/50">
            {searchTerm
              ? "No categories match your search."
              : "No categories found. Create one above to get started."}
          </div>
        ) : (
          filteredCategories.map((category) => {
            const articleCount = (category.articles?.[0]?.count ?? 0) + (category.series_posts?.[0]?.count ?? 0);
            return (
              <CategoryCard key={category.id}>
                <CategoryCard.Icon color={category.color} />
                <CategoryCard.Header
                  name={category.name}
                  description={category.description}
                  slug={category.slug}
                  articleCount={articleCount}
                />
                <CategoryCard.Actions
                  onEdit={() => setEditingCategory(category)}
                  onDelete={() => setCategoryToDelete(category)}
                />
              </CategoryCard>
            );
          })
        )}
      </div>

      <Pagination total={total} page={page} pageSize={pageSize} />

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Category"
      >
        <form onSubmit={onEditSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input {...editForm.register("name")} className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Input {...editForm.register("description")} className="h-11" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setEditingCategory(null)} type="button">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => categoryToDelete && deleteCategoryMutation.mutate(categoryToDelete.id)}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  );
}
