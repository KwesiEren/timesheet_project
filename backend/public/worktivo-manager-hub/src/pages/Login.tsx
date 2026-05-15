import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login, getMe } from "@/lib/services";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const mut = useMutation({
    mutationFn: async () => {
      // 1. Supabase Auth
      const { session } = await login(email, password);
      if (!session) throw new Error("No session returned");
      
      // Save token temporarily so getMe() can use it in interceptor
      setToken(session.access_token);
      
      // 2. Sync Profile from Backend
      try {
        const userProfile = await getMe();

        // 3. Check Super Admin Status first (org membership not required for admin portal)
        const { data: adminData } = await supabase
          .from("super_admins")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const isSuperAdmin = !!adminData;

        // 4. Organization details are required only for non-super-admin org portal access
        let orgData: { plan?: "Free" | "Paid"; status?: "active" | "suspended" } | null = null;
        if (userProfile.organizationId) {
          const { data } = await supabase
            .from("organizations")
            .select("plan, status")
            .eq("id", userProfile.organizationId)
            .maybeSingle();
          orgData = data;
        } else if (!isSuperAdmin) {
          throw new Error("No organization assigned. Please contact your administrator.");
        }

        return { 
          session, 
          userProfile: { 
            ...userProfile, 
            organizationPlan: orgData?.plan || "Free",
            organizationStatus: orgData?.status || "active"
          }, 
          isSuperAdmin
        };
      } catch (err) {
        // If profile fetch fails, logout to be safe
        useAuthStore.getState().logout();
        throw err;
      }
    },
    onSuccess: ({ session, userProfile, isSuperAdmin }) => {
      setUser({ ...userProfile, isSuperAdmin });
      
      if (userProfile.organizationStatus === "suspended" && !isSuperAdmin) {
        toast({
          title: "Account Suspended",
          description: "Your organization's access has been suspended. Please contact support.",
          variant: "destructive",
        });
        useAuthStore.getState().logout();
        return;
      }
      
      if (userProfile.role === "employee" && !isSuperAdmin) {
        toast({
          title: "Access denied",
          description: "The web portal is for Owners and Managers only.",
          variant: "destructive",
        });
        useAuthStore.getState().logout();
        return;
      }
      
      if (isSuperAdmin) {
        toast({ title: "Super Admin Access", description: `Logged in as ${userProfile.name} with platform privileges.` });
      } else {
        toast({ title: "Welcome back!", description: `Logged in as ${userProfile.name}` });
      }
      const defaultDestination = isSuperAdmin ? "/admin/" : "/manager/";
      navigate(from || defaultDestination, { replace: true });
    },
    onError: (err: any) => {
      toast({
        title: "Login failed",
        description: err.message || "Check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-card p-1 shadow-sm">
            <img
              src="/assets/icons/worktivo.png"
              alt="Worktivo logo"
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-foreground">Worktivo</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Web Portal</div>
          </div>
        </div>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Owner & Manager access only.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                mut.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={mut.isPending}
                className="h-12 w-full text-base font-semibold"
              >
                {mut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          API: <span className="font-mono-data">{import.meta.env.VITE_API_URL || "http://localhost:3000"}</span>
        </p>
      </div>
    </div>
  );
}
