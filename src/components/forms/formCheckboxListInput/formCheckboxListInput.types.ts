import { SelectItemType } from "~/common/converters/converters.types";

export interface FormCheckboxListComponentProps {
  title?: string;
  description?: string;
  label?: string;
  options: SelectItemType[];
}
