import { InputProps } from '@/components/ui/input';

export interface FormInputComponentProps extends InputProps {
  mask?: (_value: string) => string;
  unmask?: (_value: string) => string | number;
  label?: string | JSX.Element;
  description?: string;
  hideErrors?: boolean;
  icon?: JSX.Element;
  generalclassname?: string;
}
