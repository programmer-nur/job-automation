import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
}

export function FormTextarea({ name, label, className, ...props }: FormTextareaProps) {
  const { register } = useFormContext();

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="text-sm font-medium leading-none">
          {label}
        </label>
      )}
      <textarea
        id={name}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...register(name)}
        {...props}
      />
    </div>
  );
}
