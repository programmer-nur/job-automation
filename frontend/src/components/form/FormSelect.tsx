import { useFormContext } from "react-hook-form";
import { AppSelect } from "@/components/shared";

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name"> {
  name: string;
  label?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function FormSelect({ name, ...props }: FormSelectProps) {
  const { register } = useFormContext();
  return <AppSelect {...register(name)} {...props} />;
}
