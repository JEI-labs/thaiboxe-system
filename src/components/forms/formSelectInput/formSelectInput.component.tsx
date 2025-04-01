import React from 'react';
import type { FieldValues, UseControllerProps } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { FormSelectComponentProps } from './formSelectInput.component.types';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const FormSelectComponent = <T extends FieldValues>({
  control,
  name,
  rules,
  hideErrors,
  options = [],
  hasEmptyOption = true,
  description,
  ...props
}: UseControllerProps<T> & FormSelectComponentProps): React.JSX.Element => {
  const extendedOptions = hasEmptyOption
    ? [
        { value: null, textValue: props.placeholder ?? '-', icon: null },
        ...options,
      ]
    : options;

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={(): React.JSX.Element => {
        return (
          <FormField
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className={cn('space-y-3', props.className)}>
                <div className="flex flex-col">
                  <FormLabel>{props.label}</FormLabel>
                  {description && (
                    <FormLabel className="text-xs text-muted-foreground">
                      {description}
                    </FormLabel>
                  )}
                </div>
                <Select
                  {...props}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (props.onValueChange) {
                      props.onValueChange(value);
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="py-6">
                      <SelectValue placeholder={props.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {extendedOptions.map((item) => (
                      <SelectItem
                        {...item}
                        value={item.value as string}
                        key={`${item.value}_${item.textValue}`}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          {item.textValue}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!hideErrors && <FormMessage />}
              </FormItem>
            )}
          />
        );
      }}
    />
  );
};
