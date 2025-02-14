import React from "react";

import { Controller, FieldValues, UseControllerProps } from "react-hook-form";

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { Checkbox } from "../checkbox";
import { FormCheckboxListComponentProps } from "./formCheckboxListInput.types";

export const FormCheckboxListComponent = <T extends FieldValues>({
  control,
  name,
  rules,
  options = [],
  ...props
}: UseControllerProps<T> & FormCheckboxListComponentProps): React.JSX.Element => {
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
            render={() => (
              <FormItem>
                {props.description?.length || props.title?.length ? (
                  <div className="mb-4">
                    {props.title?.length ? <FormLabel className="text-base">{props.title}</FormLabel> : null}
                    {props.description?.length ? <FormDescription>{props.description}</FormDescription> : null}
                  </div>
                ) : null}

                {options.map((item) => (
                  <FormField
                    key={item.id}
                    control={control}
                    name={name}
                    render={({ field }) => {
                      return (
                        <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(field.value?.filter((value) => value !== item.id));
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal hover:cursor-pointer">{item.label}</FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }}
    />
  );
};
