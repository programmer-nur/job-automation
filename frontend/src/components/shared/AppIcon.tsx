import { type SVGAttributes } from "react";
import { cn } from "@/lib/utils";
import type { Size } from "@/types";

const SIZE_MAP: Record<Size, number> = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 22,
  xl: 28,
};

interface AppIconProps extends SVGAttributes<SVGSVGElement> {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  size?: Size | number;
}

export function AppIcon({ icon: Icon, size = "md", className, ...props }: AppIconProps) {
  const dimension = typeof size === "number" ? size : SIZE_MAP[size];

  return (
    <Icon
      size={dimension}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}
