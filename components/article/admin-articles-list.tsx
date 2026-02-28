"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Article } from "@/types/domain";
import { articleService } from "@/services/article-service";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminArticlesListProps {
  accessToken: string;
  initialArticles: Article[];
}

export function AdminArticlesList({ accessToken, initialArticles }: AdminArticlesListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const articlesQuery = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () =>
      articleService.listAdmin(
        {
          page: 1,
          pageSize: 100,
        },
        accessToken,
      ),
    initialData: {
      data: initialArticles,
      page: 1,
      pageSize: 100,
      total: initialArticles.length,
    },
    enabled: Boolean(accessToken),
  });

  const articles = articlesQuery.data?.data ?? [];

  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: string) => {
      if (!accessToken) {
        throw new Error("Missing admin session token.");
      }
      return articleService.remove(articleId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success("Article deleted");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete article");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Articles</CardTitle>
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
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No articles found.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>{article.title}</TableCell>
                  <TableCell className="capitalize">{article.status}</TableCell>
                  <TableCell>{formatDate(article.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          router.push(`/admin/articles?edit=${article.id}`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          const ok = globalThis.confirm("Delete this article?");
                          if (!ok) {
                            return;
                          }
                          deleteArticleMutation.mutate(article.id);
                        }}
                        disabled={deleteArticleMutation.isPending}
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
