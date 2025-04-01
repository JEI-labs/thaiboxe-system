import { SelectItemType } from '@/common/types/select';

export interface FormCheckboxListComponentProps {
  title?: string;
  description?: string;
  label?: string;
  options: Array<SelectItemType>;
}
