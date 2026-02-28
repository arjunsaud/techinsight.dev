import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guards";
import { adminService } from "@/services/admin-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const dashboard = session
    ? await adminService.getDashboard(session.access_token)
    : {
      stats: {
        totalArticles: 0,
        totalUsers: 0,
        totalComments: 0,
        publishedArticles: 0,
        draftArticles: 0,
      },
      recentArticles: [],
      recentComments: [],
    };

  const cards = [
    { label: "Total Articles", value: dashboard.stats.totalArticles },
    { label: "Total Users", value: dashboard.stats.totalUsers },
    { label: "Total Comments", value: dashboard.stats.totalComments },
    { label: "Draft Articles", value: dashboard.stats.draftArticles },
  ];

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
      </header>
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
