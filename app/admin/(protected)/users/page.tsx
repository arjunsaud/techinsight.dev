import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminService } from "@/services/admin-service";
import { requireAdmin } from "@/lib/supabase/guards";
import { AdminHeader } from "@/components/layout/admin-header";
import { formatDate } from "@/lib/utils";

import { Pagination } from "@/components/ui/pagination";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdmin();
  
  const resolvedParams = searchParams ? await searchParams : {};
  const page = parseInt(typeof resolvedParams.page === "string" ? resolvedParams.page : "1", 10);
  const pageSize = 10;
  
  const usersResponse = await adminService.listUsers(session.access_token, page, pageSize);

  return (
    <section className="space-y-6">
      <AdminHeader title="Users" description="Manage users" />
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(Array.isArray(usersResponse) ? usersResponse : usersResponse.data || []).map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username ?? "-"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
              {(Array.isArray(usersResponse) ? usersResponse : usersResponse.data || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <Pagination 
            page={usersResponse.page || 1} 
            pageSize={usersResponse.pageSize || 10} 
            total={usersResponse.total || (Array.isArray(usersResponse) ? usersResponse.length : 0)} 
          />
        </CardContent>
      </Card>
    </section>
  );
}
