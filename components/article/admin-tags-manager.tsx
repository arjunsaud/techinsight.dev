"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Search, X } from "lucide-react";

import type { Tag } from "@/types/domain";
import { adminService } from "@/services/admin-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagCard } from "@/components/article/admin-tag-card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Modal } from "@/components/ui/modal";

import { Pagination } from "@/components/ui/pagination";

interface AdminTagsManagerProps {
  accessToken: string;
  initialTags: Tag[];
  page: number;
  pageSize: number;
  total: number;
}

const schema = z.object({
  name: z.string().min(1, "Tag name is required").max(80),
});
type FormValues = z.infer<typeof schema>;

export function AdminTagsManager({
  accessToken,
  initialTags,
  page,
  pageSize,
  total,
}: AdminTagsManagerProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = React.useState<Tag | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const tagsQuery = useQuery({
    queryKey: ["admin-tags", page, pageSize],
    queryFn: async () => {
      const response = await adminService.listTags(accessToken, { page, pageSize });
      return Array.isArray(response) ? response : response.data || [];
    },
    initialData: initialTags,
  });

  const tags = tagsQuery.data ?? [];

  const filteredTags = React.useMemo(() => {
    return tags.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [tags, searchTerm]);

  const createTagMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!accessToken) throw new Error("Missing admin session token.");
      return adminService.createTag(values.name, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      form.reset({ name: "" });
      toast.success("Tag created");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create tag");
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: async ({ tagId, name }: { tagId: string; name: string }) => {
      if (!accessToken) throw new Error("Missing admin session token.");
      return adminService.updateTag(tagId, { name }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      setEditingTag(null);
      toast.success("Tag updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update tag");
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      if (!accessToken) throw new Error("Missing admin session token.");
      return adminService.removeTag(tagId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      setTagToDelete(null);
      toast.success("Tag deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete tag");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createTagMutation.mutate(values);
  });

  const onEditSubmit = editForm.handleSubmit((values) => {
    if (editingTag) {
      updateTagMutation.mutate({ tagId: editingTag.id, name: values.name });
    }
  });

  React.useEffect(() => {
    if (editingTag) {
      editForm.reset({ name: editingTag.name });
    }
  }, [editingTag, editForm]);

  return (
    <div className="space-y-6">
      {/* Add New Tag Card */}
      <div className="rounded-xl w-full max-w-md border bg-card p-6 shadow-sm">
        <form className="flex gap-4" onSubmit={onSubmit}>
          <div className="flex-1">
            <Input
              placeholder="Add a new tag..."
              className="h-11 shadow-none bg-background focus-visible:ring-blue-500"
              {...form.register("name")}
            />
          </div>
          <Button
            type="submit"
            className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white shrink-0 font-medium"
            disabled={createTagMutation.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </form>
      </div>

      {/* Search Tags */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tags..."
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

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTags.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            {searchTerm
              ? "No tags match your search."
              : "No tags found. Create one above!"}
          </div>
        ) : (
            filteredTags.map((tag) => {
              const articleCount = (tag.article_tags?.[0]?.count ?? 0) + (tag.series_post_tags?.[0]?.count ?? 0);
              return (
                <TagCard key={tag.id}>
                  <TagCard.Icon />
                  <TagCard.Header
                    name={tag.name}
                    articleCount={articleCount} 
                  />
                  <TagCard.Actions
                    onEdit={() => setEditingTag(tag)}
                    onDelete={() => setTagToDelete(tag)}
                  />
                </TagCard>
              );
            })
        )}
      </div>

      <Pagination total={total} page={page} pageSize={pageSize} />

      {/* Edit Modal */}
      <Modal 
        isOpen={!!editingTag} 
        onClose={() => setEditingTag(null)}
        title="Edit Tag"
      >
        <form onSubmit={onEditSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tag Name</label>
            <Input {...editForm.register("name")} className="h-11" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setEditingTag(null)} type="button">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={updateTagMutation.isPending}
            >
              {updateTagMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal 
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={() => tagToDelete && deleteTagMutation.mutate(tagToDelete.id)}
        title="Delete Tag"
        description={`Are you sure you want to delete the tag "${tagToDelete?.name}"? This action cannot be undone.`}
        isLoading={deleteTagMutation.isPending}
      />
    </div>
  );
}
