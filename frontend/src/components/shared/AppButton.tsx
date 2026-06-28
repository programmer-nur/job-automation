import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AppSpinner } from "./AppSpinner";
import type { Size } from "@/types";

const appButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/80 shadow-xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-background hover:bg-muted hover:text-foreground",
        ghost: "hover:bg-muted hover:text-foreground",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-xs",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-7 gap-1.5 px-2.5 text-xs",
        md: "h-8 gap-2 px-3 text-sm",
        lg: "h-10 gap-2.5 px-4 text-sm",
        xl: "h-12 gap-3 px-6 text-base",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface AppButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof appButtonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  iconSize?: Size;
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      className,
      variant,
      size = "md",
      loading,
      icon,
      iconLeft,
      iconRight,
      iconSize = "sm",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isIconOnly = icon && !children;

    return (
      <button
        ref={ref}
        className={cn(
          appButtonVariants({ variant, size: isIconOnly ? "icon" : size, className }),
          loading && "relative",
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <AppSpinner size={iconSize} />
        ) : (
          <>
            {iconLeft && <span className="inline-flex">{iconLeft}</span>}
            {icon && !iconLeft && !iconRight && <span className="inline-flex">{icon}</span>}
            {children}
            {iconRight && <span className="inline-flex">{iconRight}</span>}
          </>
        )}
      </button>
    );
  },
);

AppButton.displayName = "AppButton";
