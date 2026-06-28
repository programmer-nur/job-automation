import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
}

export function FormTextarea({ name, label, className, ...props }: FormTextareaProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField label={label} error={fieldState.error?.message}>
          <textarea
            id={name}
            className={cn(
              "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            {...field}
            {...props}
          />
        </FormField>
      )}
    />
  );
}
