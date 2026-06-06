import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">404</h1>
        <p className="mb-6 text-muted-foreground">This page doesn't exist or you don't have access to it.</p>
        <Button asChild>
          <Link to="/">Return to sign in</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
