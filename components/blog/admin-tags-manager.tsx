"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const [newTagName, setNewTagName] = useState("");
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});

  const tagsQuery = useQuery({
    queryKey: ["admin-tags"],
    queryFn: () => adminService.listTags(accessToken),
    initialData: initialTags,
  });

  const tags = tagsQuery.data ?? [];

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!accessToken) {
        throw new Error("Missing admin session token.");
      }
      return adminService.createTag(name, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tags"] });
      setNewTagName("");
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

  const onCreateTag = () => {
    const name = newTagName.trim();
    if (!name) {
      toast.error("Tag name is required");
      return;
    }
    createTagMutation.mutate(name);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newTagName}
            onChange={(event) => setNewTagName(event.target.value)}
            placeholder="New tag"
          />
          <Button onClick={onCreateTag} disabled={createTagMutation.isPending}>
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
                          setTagDrafts((prev) => ({
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
