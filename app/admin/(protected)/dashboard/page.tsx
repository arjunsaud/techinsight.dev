import { requireAdmin } from "@/lib/supabase/guards";
import { adminService } from "@/services/admin-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/layout/admin.header";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  const dashboard = await adminService.getDashboard(session.access_token);

  const cards = [
    { label: "Total Articles", value: dashboard.stats.totalArticles },
    { label: "Total Users", value: dashboard.stats.totalUsers },
    { label: "Total Comments", value: dashboard.stats.totalComments },
    { label: "Draft Articles", value: dashboard.stats.draftArticles },
  ];

  return (
    <section className="space-y-6">
      <AdminHeader title="Admin Dashboard" description="Admin Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
