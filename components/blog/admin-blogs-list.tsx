"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Blog } from "@/types/domain";
import { blogService } from "@/services/blog-service";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminBlogsListProps {
  accessToken: string;
  initialBlogs: Blog[];
}

export function AdminBlogsList({ accessToken, initialBlogs }: AdminBlogsListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const blogsQuery = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: () =>
      blogService.listAdmin(
        {
          page: 1,
          pageSize: 100,
        },
        accessToken,
      ),
    initialData: {
      data: initialBlogs,
      page: 1,
      pageSize: 100,
      total: initialBlogs.length,
    },
    enabled: Boolean(accessToken),
  });

  const blogs = blogsQuery.data?.data ?? [];

  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId: string) => {
      if (!accessToken) {
        throw new Error("Missing admin session token.");
      }
      return blogService.remove(blogId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
      toast.success("Blog deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete blog");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Blogs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[220px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No blogs found.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell className="capitalize">{blog.status}</TableCell>
                  <TableCell>{formatDate(blog.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          router.push(`/admin/blogs?edit=${blog.id}`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const ok = globalThis.confirm("Delete this blog?");
                          if (!ok) {
                            return;
                          }
                          deleteBlogMutation.mutate(blog.id);
                        }}
                        disabled={deleteBlogMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
