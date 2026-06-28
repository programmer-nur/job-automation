import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const appBadgeVariants = cva(
  "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary ring-primary/20",
        secondary: "bg-secondary text-secondary-foreground ring-border",
        destructive: "bg-destructive/10 text-destructive ring-destructive/20",
        success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20",
        warning: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/20",
        info: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/20",
        outline: "text-foreground ring-border",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        md: "px-2 py-0.5 text-xs",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

interface AppBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof appBadgeVariants> {
  dot?: boolean;
}

export function AppBadge({ className, variant, size, dot, children, ...props }: AppBadgeProps) {
  return (
    <span className={cn(appBadgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="mr-1.5 size-1.5 rounded-full bg-current" aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
