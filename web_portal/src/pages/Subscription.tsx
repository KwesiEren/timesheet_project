import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Check, Zap, ShieldCheck, ArrowRight, Activity, Users, FolderKanban, CreditCard, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { PageHeader } from "@/components/PageHeader";

export default function Subscription() {
  const navigate = useNavigate();
  const { isPaid, usage, limits } = useSubscription();

  const projectUsage = ((usage?.projects || 0) / (limits.projects || 1)) * 100;
  const employeeUsage = ((usage?.employees || 0) / (limits.employees || 1)) * 100;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Billing"
        title="Subscription & Plan"
        description="Track your usage limits, change plans, and contact support for enterprise pricing."
        icon={CreditCard}
        actions={
          <Badge
            variant={isPaid ? "default" : "secondary"}
            className={`px-4 py-1.5 text-sm font-bold ${isPaid ? "bg-gradient-primary shadow-elegant" : ""}`}
          >
            {isPaid ? "Paid Tier" : "Free Tier"}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Usage Overview */}
        <Card className="border-border/60 bg-card shadow-card md:col-span-2">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Usage Overview
            </CardTitle>
            <CardDescription>How much of your current plan limits you've consumed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 py-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  Projects
                </div>
                <span className="font-mono-data font-bold">
                  {usage?.projects || 0} / {isPaid ? "∞" : limits.projects}
                </span>
              </div>
              <Progress value={isPaid ? 0 : projectUsage} className="h-2.5 bg-muted" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Employees
                </div>
                <span className="font-mono-data font-bold">
                  {usage?.employees || 0} / {isPaid ? "∞" : limits.employees}
                </span>
              </div>
              <Progress value={isPaid ? 0 : employeeUsage} className="h-2.5 bg-muted" />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/60 bg-muted/30 py-3.5">
            <p className="text-xs italic text-muted-foreground">
              Limits are enforced at the database level for absolute reliability.
            </p>
          </CardFooter>
        </Card>

        {/* Current Plan Card */}
        <Card
          className={`relative overflow-hidden border-2 shadow-card ${
            isPaid ? "border-primary/60 bg-gradient-card" : "border-border/60 bg-card"
          }`}
        >
          {isPaid && (
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
          )}
          {isPaid && (
            <div className="absolute right-0 top-0 rounded-bl-lg bg-gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Active
            </div>
          )}
          <CardHeader className="relative">
            <CardTitle className="text-xl">{isPaid ? "Paid Tier" : "Free Tier"}</CardTitle>
            <CardDescription>
              {isPaid ? "Full enterprise access enabled." : "Basic features with capacity caps."}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4">
            <div className="font-mono-data text-3xl font-bold">
              {isPaid ? "$149" : "$0"}
              <span className="text-sm font-normal text-muted-foreground"> / month</span>
            </div>
            <Separator className="bg-border" />
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-success" />
                {isPaid ? "Unlimited Projects" : `Max ${limits.projects} Projects`}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-success" />
                {isPaid ? "Unlimited Employees" : `Max ${limits.employees} Employees`}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-success" />
                Real-time Reporting
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-success" />
                Geofencing & GPS
              </li>
            </ul>
          </CardContent>
          {!isPaid && (
            <CardFooter className="relative">
              <Button
                className="w-full gap-2 bg-gradient-primary shadow-elegant hover:opacity-95"
                onClick={() => navigate("/manager/subscription")}
              >
                <Zap className="h-4 w-4 fill-current" />
                Upgrade to Paid
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Benefits Section */}
      <section className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Enterprise Security", desc: "Data encryption at rest and in transit with row-level access policies." },
          { icon: Zap, title: "Scalable Capacity", desc: "Upgrade instantly as your team grows beyond the free-tier limits." },
          { icon: Sparkles, title: "Advanced Analytics", desc: "Generate deep payroll insights and live workforce trends." },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-6 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold">{title}</h3>
            <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      <div className="relative flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-card sm:flex-row sm:items-center">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-accent opacity-10 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Need help with your plan?</h4>
            <p className="text-xs text-muted-foreground">Contact support for custom enterprise pricing or multi-org discounts.</p>
          </div>
        </div>
        <Button variant="outline" className="relative gap-2">
          Contact Support <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
