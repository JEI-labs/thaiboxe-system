import { ButtonProps } from "@/components/ui/button";

export interface SelectWithSearchProps
  extends Omit<ButtonProps, "onChange" | "value"> {
  label?: string;
  options?: {
    value: string | null;
    textValue: string;
  }[];
  placeholder?: string;
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  disabled?: boolean;
  hasEmptyOption?: boolean;
}
