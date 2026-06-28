import { cn } from "@/lib/utils";

interface DivProps extends React.HTMLAttributes<HTMLDivElement> {
  flex?: boolean;
  col?: boolean;
  center?: boolean;
  between?: boolean;
  around?: boolean;
  evenly?: boolean;
  wrap?: boolean;
  gap?: 0 | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  p?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
  px?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
  py?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
  m?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
  mx?: "auto" | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
  my?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10;
}

export function Div({
  className,
  flex,
  col,
  center,
  between,
  around,
  evenly,
  wrap,
  gap,
  p,
  px,
  py,
  m,
  mx,
  my,
  children,
  ...props
}: DivProps) {
  const classes = cn(
    flex && "flex",
    flex && col && "flex-col",
    flex && center && "items-center",
    flex && center && !col && "justify-center",
    flex && col && center && "justify-center",
    flex && between && "justify-between",
    flex && around && "justify-around",
    flex && evenly && "justify-evenly",
    wrap && "flex-wrap",
    gap !== undefined && `gap-${gap}`,
    p !== undefined && `p-${p}`,
    px !== undefined && `px-${px}`,
    py !== undefined && `py-${py}`,
    m !== undefined && `m-${m}`,
    mx !== undefined && (mx === "auto" ? "mx-auto" : `mx-${mx}`),
    my !== undefined && `my-${my}`,
    className,
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
