import { type FieldError, useFormContext } from "react-hook-form";

interface FormFieldProps {
  name?: string;
  label?: string;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ name, label, error: externalError, description, children, className }: FormFieldProps) {
  let fieldError: FieldError | undefined;
  try {
    const formContext = useFormContext();
    if (name) {
      fieldError = formContext.formState.errors[name] as FieldError | undefined;
    }
  } catch {
    // No FormProvider available — use externalError only
  }
  const error = fieldError?.message ?? externalError;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="mb-1.5 block text-sm font-medium leading-none">
          {label}
        </label>
      )}
      {children}
      {description && !error && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
