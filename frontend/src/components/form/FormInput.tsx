import { Controller, useFormContext } from "react-hook-form";
import { AppInput } from "@/components/shared";
import { FormField } from "./FormField";

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  label?: string;
}

export function FormInput({ name, label, ...props }: FormInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField label={label} error={fieldState.error?.message}>
          <AppInput {...field} {...props} />
        </FormField>
      )}
    />
  );
}
