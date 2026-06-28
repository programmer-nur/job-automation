import { type ElementType, createElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const appTextVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-3xl font-semibold tracking-tight lg:text-4xl",
      h2: "scroll-m-20 text-2xl font-semibold tracking-tight lg:text-3xl",
      h3: "scroll-m-20 text-xl font-semibold tracking-tight lg:text-2xl",
      h4: "scroll-m-20 text-lg font-semibold tracking-tight",
      body: "text-base leading-7",
      bodySm: "text-sm leading-6",
      small: "text-xs leading-5",
      caption: "text-[11px] leading-4 text-muted-foreground",
      label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    },
    color: {
      default: "",
      primary: "text-primary",
      muted: "text-muted-foreground",
      destructive: "text-destructive",
      success: "text-emerald-600 dark:text-emerald-400",
      warning: "text-amber-600 dark:text-amber-400",
      info: "text-blue-600 dark:text-blue-400",
      inherit: "",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "default",
  },
});

interface AppTextProps
  extends VariantProps<typeof appTextVariants>,
    Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  as?: ElementType;
  truncate?: boolean;
}

function getDefaultElement(variant: AppTextProps["variant"]): ElementType {
  switch (variant) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
      return variant;
    case "label":
      return "label";
    default:
      return "p";
  }
}

export function AppText({
  className,
  variant,
  color,
  weight,
  align,
  as,
  truncate,
  children,
  ...props
}: AppTextProps) {
  const tag = as ?? getDefaultElement(variant);

  return createElement(
    tag,
    {
      className: cn(
        appTextVariants({ variant, color, weight, align }),
        truncate && "truncate",
        className,
      ),
      ...props,
    },
    children,
  );
}
