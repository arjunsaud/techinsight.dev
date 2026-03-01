"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import type { Tag } from "@/types/domain";
import { adminService } from "@/services/admin-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagCard } from "@/components/article/admin-tag-card";

interface AdminTagsManagerProps {
  accessToken: string;
  initialTags: Tag[];
}

export function AdminTagsManager({
  accessToken,
  initialTags,
}: AdminTagsManagerProps) {
  const queryClient = useQueryClient();

  const schema = z.object({
    name: z.string().min(1, "Tag name is required").max(80),
  });
  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const tagsQuery = useQuery({
    queryKey: ["admin-tags"],
    queryFn: () => adminService.listTags(accessToken),
    initialData: initialTags,
  });

  const tags = tagsQuery.data ?? [];

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
      toast.error(
        error instanceof Error ? error.message : "Failed to create tag",
      );
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      if (!accessToken) throw new Error("Missing admin session token.");
      return adminService.removeTag(tagId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag deleted");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete tag",
      );
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createTagMutation.mutate(values);
  });

  return (
    <div className="space-y-6">
      {/* Add New Tag Card */}
      <div className="rounded-xl w-1/2 border bg-card p-6 shadow-sm">
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

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tags.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            No tags found. Create one above!
          </div>
        ) : (
          tags.map((tag) => (
            <TagCard key={tag.id}>
              <TagCard.Icon />
              <TagCard.Header
                name={tag.name}
                articleCount={tag.id.length * 2} // Mocked count, wait, let's just make it look good for now until API provides it
              />
              <TagCard.Delete
                onDelete={() => {
                  const ok = globalThis.confirm("Delete this tag?");
                  if (!ok) return;
                  deleteTagMutation.mutate(tag.id);
                }}
              />
            </TagCard>
          ))
        )}
      </div>
    </div>
  );
}
