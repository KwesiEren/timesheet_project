import { ReactNode } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { AlertCircle } from "lucide-react";

interface QueryStateProps {
  isLoading: boolean;
  isError?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyIcon?: React.ElementType;
  emptyTitle?: string;
  emptyDescription?: string;
  skeleton?: ReactNode;
  children: ReactNode;
}

export function QueryState({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  emptyIcon: EmptyIcon = AlertCircle,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  skeleton,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      skeleton ?? (
        <div className="flex flex-col gap-3 p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Could not load data"
        description={error?.message ?? "Something went wrong. Please try again."}
        action={
          onRetry ? (
            <Button variant="outline" className="gap-2" onClick={onRetry}>
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          ) : undefined
        }
        className="my-4"
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={EmptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        className="my-4"
      />
    );
  }

  return <>{children}</>;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center p-12 text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Loading…
    </div>
  );
}
