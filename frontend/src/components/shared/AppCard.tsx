import { cn } from "@/lib/utils";

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function AppCard({ className, hover, padding = "md", children, ...props }: AppCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-xs",
        paddingClasses[padding],
        hover && "transition-colors hover:bg-accent/50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AppCardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export function AppCardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export function AppCardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-4 flex items-center pt-4 border-t", className)} {...props}>
      {children}
    </div>
  );
}
