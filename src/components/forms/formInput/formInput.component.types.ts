import { InputProps } from "@/components/ui/input";

export interface FormInputComponentProps extends InputProps {
  mask?: (value: string) => string;
  unmask?: (value: string) => string | number;
  label?: string | JSX.Element;
  description?: string;
  hideErrors?: boolean;
  icon?: JSX.Element;
  generalclassname?: string;
}
