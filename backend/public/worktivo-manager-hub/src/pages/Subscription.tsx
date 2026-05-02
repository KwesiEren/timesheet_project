import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Zap, ShieldCheck, ArrowRight, Activity, Users, FolderKanban } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";

export default function Subscription() {
  const navigate = useNavigate();
  const { isPaid, usage, limits } = useSubscription();

  const projectUsage = ((usage?.projects || 0) / (limits.projects || 1)) * 100;
  const employeeUsage = ((usage?.employees || 0) / (limits.employees || 1)) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscription & Billing</h1>
          <p className="text-sm text-muted-foreground">Manage your plan and monitor usage limits.</p>
        </div>
        <Badge variant={isPaid ? "default" : "secondary"} className="w-fit text-sm py-1 px-4">
          Current Plan: {isPaid ? "Paid Tier" : "Free Tier"}
        </Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Usage Overview */}
        <Card className="md:col-span-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Usage Overview
            </CardTitle>
            <CardDescription>How much of your current plan limits you've used.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  Projects
                </div>
                <span className="font-mono-data">{usage?.projects || 0} / {isPaid ? "Unlimited" : limits.projects}</span>
              </div>
              <Progress value={isPaid ? 0 : projectUsage} className="h-2 bg-secondary" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Employees
                </div>
                <span className="font-mono-data">{usage?.employees || 0} / {isPaid ? "Unlimited" : limits.employees}</span>
              </div>
              <Progress value={isPaid ? 0 : employeeUsage} className="h-2 bg-secondary" />
            </div>
          </CardContent>
          <CardFooter className="bg-secondary/10 border-t border-border py-4">
            <p className="text-xs text-muted-foreground italic">
              Limits are strictly enforced at the database level.
            </p>
          </CardFooter>
        </Card>

        {/* Current Plan Card */}
        <Card className={`border-2 ${isPaid ? 'border-primary/50' : 'border-border'} bg-card relative overflow-hidden`}>
          {isPaid && (
            <div className="absolute top-0 right-0 p-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded-bl-lg">
              Active
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl">{isPaid ? "Paid Tier" : "Free Tier"}</CardTitle>
            <CardDescription>
              {isPaid ? "Full enterprise access enabled." : "Basic features with capacity limits."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">
              {isPaid ? "$149" : "$0"}
              <span className="text-sm font-normal text-muted-foreground"> / month</span>
            </div>
            <Separator className="bg-border" />
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                {isPaid ? "Unlimited Projects" : "Max 2 Projects"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                {isPaid ? "Unlimited Employees" : "Max 5 Employees"}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Real-time Reporting
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                Geofencing & GPS
              </li>
            </ul>
          </CardContent>
          {!isPaid && (
            <CardFooter>
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90" onClick={() => navigate("/subscription")}>
                <Zap className="h-4 w-4 fill-current" />
                Upgrade to Paid
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Benefits Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border">
          <ShieldCheck className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-bold">Enterprise Security</h3>
          <p className="text-xs text-muted-foreground mt-2">Data encryption at rest and in transit with full RLS protection.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border">
          <Zap className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-bold">Scalable Capacity</h3>
          <p className="text-xs text-muted-foreground mt-2">Upgrade instantly as your team grows beyond 5 members.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border">
          <Activity className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-bold">Advanced Analytics</h3>
          <p className="text-xs text-muted-foreground mt-2">Generate deep payroll insights and workforce trends.</p>
        </div>
      </section>

      <div className="bg-secondary/30 rounded-xl p-6 flex items-center justify-between border border-border">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Need help with your plan?</h4>
            <p className="text-xs text-muted-foreground">Contact support for custom enterprise pricing or multi-org discounts.</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          Contact Support <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px w-full ${className}`} />;
}
