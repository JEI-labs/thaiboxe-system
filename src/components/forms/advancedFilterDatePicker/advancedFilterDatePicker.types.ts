import type { DateRange } from "react-day-picker";
import type { ButtonProps } from "../button";

export interface AdvancedFilterDatePickerProps {
  open?: boolean;
  defaultValue?: AdvancedFilterDatePickerType;
  title: string;
  description?: string;
  onChange?: (values: AdvancedFilterDatePickerType) => void;
  buttonProps?: ButtonProps;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  numberOfMonths?: number;
}

export interface AdvancedFilterDatePickerType extends DateRange {}
