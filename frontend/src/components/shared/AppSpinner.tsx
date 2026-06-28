import { cn } from "@/lib/utils";
import type { Size } from "@/types";

const SIZE_MAP: Record<Size, string> = {
  xs: "size-3",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-10",
};

interface AppSpinnerProps {
  size?: Size;
  className?: string;
}

export function AppSpinner({ size = "md", className }: AppSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground",
        SIZE_MAP[size],
        className,
      )}
    />
  );
}
