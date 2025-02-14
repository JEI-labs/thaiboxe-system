"use client";

import * as React from "react";

import { Trash2 } from "lucide-react";
import { ptBR } from "date-fns/locale";
import moment from "moment-timezone";
import "moment/locale/pt-br";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuLabel,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBoolean } from "~/hooks/useBooleanState/useBooleanState.hook";

import { Calendar } from "~/components/ui/calendar";
import type { AdvancedFilterDatePickerProps, AdvancedFilterDatePickerType } from "./advancedFilterDatePicker.types";

moment.locale("pt-br");

export function AdvancedFilterDatePicker({
  showDeleteButton = true,
  ...props
}: Readonly<AdvancedFilterDatePickerProps>): JSX.Element {
  const open = useBoolean(props.open);
  const [date, setDate] = React.useState<AdvancedFilterDatePickerType | undefined>(
    props.defaultValue ?? {
      from: undefined,
      to: undefined,
    },
  );

  const handleFormatDate = (date?: AdvancedFilterDatePickerType): AdvancedFilterDatePickerType => {
    let formattedDate: AdvancedFilterDatePickerType = {
      from: date?.from,
      to: date?.to,
    };

    if (date?.from && date.to) {
      formattedDate.from = moment(date.from).tz("America/Sao_Paulo").startOf("day").toDate();
      formattedDate.to = moment(date.to).tz("America/Sao_Paulo").endOf("day").toDate();
    } else if (date?.from) {
      formattedDate.from = moment(date.from).tz("America/Sao_Paulo").startOf("day").toDate();
      formattedDate.to = moment(date.from).tz("America/Sao_Paulo").endOf("day").toDate();
    }

    return formattedDate;
  };

  const handleChangeDate = (date: AdvancedFilterDatePickerType) => {
    const formattedDate = handleFormatDate(date);
    setDate(formattedDate);

    if (props.onChange) {
      props.onChange(formattedDate);
    }
  };

  React.useEffect(() => {
    const formattedDate = handleFormatDate(props.defaultValue);

    setDate({
      from: formattedDate.from ? formattedDate.from : undefined,
      to: formattedDate.to ? formattedDate.to : undefined,
    });
  }, [props.defaultValue]);

  return (
    <DropdownMenu open={open.value} onOpenChange={open.actions.setValue}>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2" variant="outline" {...props.buttonProps}>
          {props.leftIcon}
          {props.title}
          {props.rightIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <div className="flex items-center justify-between">
          <DropdownMenuLabel>{props?.description ?? "Selecione a data abaixo"}</DropdownMenuLabel>
          {showDeleteButton && (
            <Button variant="ghost" onClick={props.onDelete}>
              <Trash2 size={16} />
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        <Calendar
          mode="range"
          selected={date}
          onSelect={handleChangeDate}
          numberOfMonths={props.numberOfMonths ?? 1}
          locale={ptBR}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
