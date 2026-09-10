import * as React from 'react';

import { TextAreaProps } from './TextArea';

export interface FormTextAreaComponentProps extends TextAreaProps {
  mask?: (_value: string) => string;
  unmask?: (_value: string) => string | number;
  label?: string | React.JSX.Element;
  description?: string;
  hideErrors?: boolean;
  icon?: React.JSX.Element;
  classname?: string;
  generalclassname?: string;
}
