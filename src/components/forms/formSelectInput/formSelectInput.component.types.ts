import type { SelectItemProps } from "@radix-ui/react-select";

export interface ExtendedSelectItemProps extends SelectItemProps {
  icon?: React.JSX.Element;
}

export interface FormSelectComponentProps {
  label?: string;
  hideErrors?: boolean;
  defaultValue?: string;
  onValueChange?(value: string): void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  dir?: "ltr" | "rtl";
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  options?: Array<ExtendedSelectItemProps>;
  placeholder?: string;
  hasEmptyOption?: boolean;
  className?: string;
  description?: string;
}
