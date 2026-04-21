import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/services";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HardHat, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || "/";

  const mut = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (data) => {
      setToken(data.token);
      const user = useAuthStore.getState().user;
      if (!user) {
        toast({ title: "Invalid token returned", variant: "destructive" });
        return;
      }
      if (user.role === "employee") {
        toast({
          title: "Access denied",
          description: "The web portal is for Owners and Managers only.",
          variant: "destructive",
        });
        useAuthStore.getState().logout();
        return;
      }
      navigate(from, { replace: true });
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast({
        title: "Login failed",
        description: err?.response?.data?.message || err.message || "Check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HardHat className="h-7 w-7" />
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
