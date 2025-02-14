import type { SelectItemType } from "~/common/converters/converters.types";
import type { ButtonProps } from "../button";

export interface AdvancedFilterCheckboxProps {
  open?: boolean;
  defaultValue?: Array<AdvancedFilterCheckboxType>;
  options: Array<AdvancedFilterCheckboxType>;
  title: string;
  showCounterIndicator?: boolean;
  description?: string;
  buttonProps?: ButtonProps;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  onChange?: (values: Array<AdvancedFilterCheckboxType>) => void;
}

export interface AdvancedFilterCheckboxType extends SelectItemType {}
