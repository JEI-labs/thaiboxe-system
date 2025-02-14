"use client";

import * as React from "react";

import { Trash2 } from "lucide-react";
import type { DefaultValues, FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import lodash from "lodash";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuLabel,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBoolean } from "~/hooks/useBooleanState/useBooleanState.hook";

import { Form } from "~/components/ui/form";
import { ScrollArea } from "~/components/ui/scroll-area";
import { FormInputComponent } from "~/components/ui/formInput/formInput.component";
import type { AdvancedFilterTextInputProps } from "./advancedFilterTextInput.types";

export function AdvancedFilterTextInput<T extends FieldValues>({
  showDeleteButton = true,
  defaultValue,
  onChange,
  rightIcon,
  leftIcon,
  title,
  onDelete,
  validationMode,
  buttonProps,
  ...props
}: Readonly<AdvancedFilterTextInputProps<T>>): JSX.Element {
  const open = useBoolean(props.open);

  const inputProps = lodash.omit(props, ["zodResolver", "description"]);

  const form = useForm<T>({
    resolver: props.zodResolver ? zodResolver(props.zodResolver) : undefined,
    defaultValues: defaultValue ?? ({ [props.name]: "" } as DefaultValues<T>),
    mode: validationMode ?? "onSubmit",
  });

  const onSubmit = (data: T): void => {
    if (onChange) {
      onChange(data[props.name]);
    }
  };

  React.useEffect(() => {
    if (!open.value) {
      const submit = form.handleSubmit(onSubmit);
      submit();
    }
  }, [open?.value]);

  return (
    <DropdownMenu open={open.value} onOpenChange={open.actions.setValue}>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2" variant="outline" {...buttonProps}>
          {leftIcon}
          {title}
          {rightIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <div className="flex items-center justify-between">
          <DropdownMenuLabel>{props?.description ?? "Informe os dados abaixo"}</DropdownMenuLabel>
          {showDeleteButton && (
            <Button variant="ghost" onClick={onDelete}>
              <Trash2 size={16} />
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[250px] w-[350px] overflow-y-auto">
          <Form {...form}>
            <form
              className=" flex flex-col gap-3 p-3"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <FormInputComponent
                {...inputProps}
                control={form.control}
                name={props.name}
                label={props.label}
                placeholder={props.placeholder}
                description={props.inputDescription}
              />
            </form>
          </Form>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
