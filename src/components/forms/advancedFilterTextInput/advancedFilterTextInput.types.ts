import type { ButtonProps } from 'react-day-picker';
import type { DefaultValues, Path, ValidationMode } from 'react-hook-form';
import type { ZodType } from 'zod';
import type { FormInputComponentProps } from '../formInput/formInput.component.types';

export interface AdvancedFilterTextInputProps<T>
  extends Omit<FormInputComponentProps, 'defaultValue' | 'onChange'> {
  name: Path<T>;
  placeholder: string;
  zodResolver?: ZodType;
  defaultValue?: DefaultValues<T>;
  open?: boolean;
  title: string;
  description?: string;
  buttonProps?: ButtonProps;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  showDeleteButton?: boolean;
  validationMode?: keyof ValidationMode;
  inputDescription?: string;
  onChange?: (_values: string) => void;
  onDelete?: () => void;
}
