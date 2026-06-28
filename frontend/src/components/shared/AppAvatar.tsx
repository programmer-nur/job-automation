import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away" | "busy";
}

const SIZE_PX = {
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56,
};

const SIZE_MAP = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
  xl: "size-14 text-lg",
};

const STATUS_SIZE = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
  xl: "size-3.5",
};

const STATUS_COLORS = {
  online: "bg-emerald-500",
  offline: "bg-muted-foreground",
  away: "bg-amber-500",
  busy: "bg-destructive",
};

export function AppAvatar({
  className,
  src,
  alt = "",
  fallback,
  size = "md",
  status,
  ...props
}: AppAvatarProps) {
  const initials = fallback ?? getInitials(alt);

  return (
    <div className={cn("relative inline-flex shrink-0", className)} {...props}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground overflow-hidden",
          SIZE_MAP[size],
        )}
      >
        {src ? (
          <Image src={src} alt={alt} width={SIZE_PX[size]} height={SIZE_PX[size]} className="object-cover" />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background",
            STATUS_SIZE[size],
            STATUS_COLORS[status],
          )}
          aria-label={status}
        />
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
