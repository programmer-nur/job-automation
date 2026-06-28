export type IconName = string;

export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export type Size = "xs" | "sm" | "md" | "lg" | "xl";

export type Color =
  | "primary"
  | "secondary"
  | "accent"
  | "muted"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | "inherit";

export type Align = "left" | "center" | "right";
