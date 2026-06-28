import { Controller, useFormContext } from "react-hook-form";
import { AppSelect } from "@/components/shared";

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name"> {
  name: string;
  label?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function FormSelect({ name, label, options, placeholder, ...props }: FormSelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <AppSelect
          label={label}
          options={options}
          placeholder={placeholder}
          error={fieldState.error?.message}
          {...field}
          {...props}
        />
      )}
    />
  );
}
