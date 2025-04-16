import { TextAreaProps } from './TextArea';

export interface FormTextAreaComponentProps extends TextAreaProps {
  mask?: (_value: string) => string;
  unmask?: (_value: string) => string | number;
  label?: string | JSX.Element;
  description?: string;
  hideErrors?: boolean;
  icon?: JSX.Element;
  classname?: string;
  generalclassname?: string;
}
