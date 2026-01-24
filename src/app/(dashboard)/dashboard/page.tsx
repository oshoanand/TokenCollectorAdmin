import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, DollarSign, ShoppingCart, Users } from "lucide-react";
import OverviewChart from "@/components/overview-chart";
import { dashboardMetrics } from "@/lib/placeholder-data";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // 2. Security Check: If no session exists, redirect immediately
  // (Middleware handles this usually, but this serves as a robust fallback)
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }
  const icons = {
    revenue: <DollarSign className="text-muted-foreground h-4 w-4" />,
    users: <Users className="text-muted-foreground h-4 w-4" />,
    orders: <ShoppingCart className="text-muted-foreground h-4 w-4" />,
    growth: <BarChart className="text-muted-foreground h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Dashboard
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.label}
              </CardTitle>
              {icons[metric.id as keyof typeof icons]}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>A summary of recent activity.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
