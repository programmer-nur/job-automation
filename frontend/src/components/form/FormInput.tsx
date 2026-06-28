import { useFormContext } from "react-hook-form";
import { AppInput } from "@/components/shared";

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  label?: string;
}

export function FormInput({ name, ...props }: FormInputProps) {
  const { register } = useFormContext();
  return <AppInput {...register(name)} {...props} />;
}
