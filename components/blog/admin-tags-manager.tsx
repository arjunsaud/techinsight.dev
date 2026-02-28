"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import type { Tag } from "@/types/domain";
import { adminService } from "@/services/admin-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminTagsManagerProps {
  accessToken: string;
  initialTags: Tag[];
}

export function AdminTagsManager({ accessToken, initialTags }: AdminTagsManagerProps) {
  const queryClient = useQueryClient();
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});

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
      if (!accessToken) {
        throw new Error("Missing admin session token.");
      }
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
      if (!accessToken) {
        throw new Error("Missing admin session token.");
      }
      return adminService.updateTag(tagId, { name }, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      toast.success("Tag updated");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update tag");
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      if (!accessToken) {
        throw new Error("Missing admin session token.");
      }
      return adminService.removeTag(tagId, accessToken);
    },
    onSuccess: (_, tagId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      setTagDrafts((prev) => {
        const next = { ...prev };
        delete next[tagId];
        return next;
      });
      toast.success("Tag deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete tag");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createTagMutation.mutate(values);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex gap-2" onSubmit={onSubmit}>
          <Input placeholder="New tag" {...form.register("name")} />
          <Button type="submit" disabled={createTagMutation.isPending}>
            {createTagMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-muted-foreground">
                  No tags found.
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => {
                const draft = tagDrafts[tag.id] ?? tag.name;
                return (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <Input
                        value={draft}
                        onChange={(event) =>
                          setTagDrafts((prev: Record<string, string>) => ({
                            ...prev,
                            [tag.id]: event.target.value,
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
                              toast.error("Tag name is required");
                              return;
                            }
                            updateTagMutation.mutate({ tagId: tag.id, name });
                          }}
                          disabled={updateTagMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const ok = globalThis.confirm("Delete this tag?");
                            if (!ok) {
                              return;
                            }
                            deleteTagMutation.mutate(tag.id);
                          }}
                          disabled={deleteTagMutation.isPending}
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
