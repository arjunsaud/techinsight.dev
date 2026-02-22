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
        totalBlogs: 0,
        totalUsers: 0,
        totalComments: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
      },
      recentBlogs: [],
      recentComments: [],
    };

  const cards = [
    { label: "Total Blogs", value: dashboard.stats.totalBlogs },
    { label: "Total Users", value: dashboard.stats.totalUsers },
    { label: "Total Comments", value: dashboard.stats.totalComments },
    { label: "Draft Blogs", value: dashboard.stats.draftBlogs },
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
