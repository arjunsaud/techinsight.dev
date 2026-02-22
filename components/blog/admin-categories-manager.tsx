"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Category } from "@/types/domain";
import { adminService } from "@/services/admin-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminCategoriesManagerProps {
  accessToken: string;
  initialCategories: Category[];
}

export function AdminCategoriesManager({
  accessToken,
  initialCategories,
}: AdminCategoriesManagerProps) {
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>({});

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminService.listCategories(accessToken),
    initialData: initialCategories,
  });

  const categories = categoriesQuery.data ?? [];

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!accessToken) {
        throw new Error("Missing admin session token.");
      }
      return adminService.createCategory(name, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setNewCategoryName("");
      toast.success("Category created");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ categoryId, name }: { categoryId: string; name: string }) => {
      if (!accessToken) {
        throw new Error("Missing admin session token.");
      }
      return adminService.updateCategory(categoryId, { name }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update category");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!accessToken) {
        throw new Error("Missing admin session token.");
      }
      return adminService.removeCategory(categoryId, accessToken);
    },
    onSuccess: (_, categoryId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setCategoryDrafts((prev) => {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      });
      toast.success("Category deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    },
  });

  const onCreateCategory = () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    createCategoryMutation.mutate(name);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="New category"
          />
          <Button onClick={onCreateCategory} disabled={createCategoryMutation.isPending}>
            Add
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => {
                const draft = categoryDrafts[category.id] ?? category.name;
                return (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Input
                        value={draft}
                        onChange={(event) =>
                          setCategoryDrafts((prev) => ({
                            ...prev,
                            [category.id]: event.target.value,
                          }))}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const name = draft.trim();
                            if (!name) {
                              toast.error("Category name is required");
                              return;
                            }
                            updateCategoryMutation.mutate({ categoryId: category.id, name });
                          }}
                          disabled={updateCategoryMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const ok = globalThis.confirm("Delete this category?");
                            if (!ok) {
                              return;
                            }
                            deleteCategoryMutation.mutate(category.id);
                          }}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
