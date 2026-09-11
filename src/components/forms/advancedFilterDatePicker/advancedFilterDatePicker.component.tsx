'use client';

import { useResetOnChange } from '@/hooks/useResetOnChange/useResetOnChange.hook';
import * as React from 'react';

import { Trash2 } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuLabel,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
  AdvancedFilterDatePickerProps,
  AdvancedFilterDatePickerType,
} from './advancedFilterDatePicker.types';
import { useBoolean } from '@/hooks/useBooleanState/useBooleanState.hook';
import moment from 'moment-timezone';
import { DefaultCalendar } from '@/components/ui/default-calendar';

moment.locale('pt-br');

/**
 * Atalhos de período. Devolvem datas cruas — `handleFormatDate` normaliza
 * início/fim do dia no fuso de São Paulo, igual à seleção pelo calendário.
 */
const DATE_PRESETS: Array<{
  label: string;
  getRange: () => { from: Date; to: Date };
}> = [
  {
    label: 'Hoje',
    getRange: () => ({ from: moment().toDate(), to: moment().toDate() }),
  },
  {
    label: 'Ontem',
    getRange: () => ({
      from: moment().subtract(1, 'day').toDate(),
      to: moment().subtract(1, 'day').toDate(),
    }),
  },
  {
    label: 'Últimos 7 dias',
    getRange: () => ({
      from: moment().subtract(6, 'days').toDate(),
      to: moment().toDate(),
    }),
  },
  {
    label: 'Últimos 30 dias',
    getRange: () => ({
      from: moment().subtract(29, 'days').toDate(),
      to: moment().toDate(),
    }),
  },
  {
    label: 'Este mês',
    getRange: () => ({
      from: moment().startOf('month').toDate(),
      to: moment().endOf('month').toDate(),
    }),
  },
];

export function AdvancedFilterDatePicker({
  showDeleteButton = true,
  ...props
}: Readonly<AdvancedFilterDatePickerProps>): React.JSX.Element {
  const open = useBoolean(props.open);
  const [date, setDate] = React.useState<
    AdvancedFilterDatePickerType | undefined
  >(
    props.defaultValue ?? {
      from: undefined,
      to: undefined,
    },
  );

  const handleFormatDate = (
    date?: AdvancedFilterDatePickerType,
  ): AdvancedFilterDatePickerType => {
    const formattedDate: AdvancedFilterDatePickerType = {
      from: date?.from,
      to: date?.to,
    };

    if (date?.from && date.to) {
      formattedDate.from = moment(date.from)
        .tz('America/Sao_Paulo')
        .startOf('day')
        .toDate();
      formattedDate.to = moment(date.to)
        .tz('America/Sao_Paulo')
        .endOf('day')
        .toDate();
    } else if (date?.from) {
      formattedDate.from = moment(date.from)
        .tz('America/Sao_Paulo')
        .startOf('day')
        .toDate();
      formattedDate.to = moment(date.from)
        .tz('America/Sao_Paulo')
        .endOf('day')
        .toDate();
    }

    return formattedDate;
  };

  const handleChangeDate = (date: AdvancedFilterDatePickerType | undefined) => {
    const formattedDate = handleFormatDate(date);
    setDate(formattedDate);

    if (props.onChange) {
      props.onChange(formattedDate);
    }
  };

  // Sincroniza com a prop durante o render em vez de num efeito, que
  // confirmaria a data velha na tela antes de corrigi-la.
  useResetOnChange([props.defaultValue], () => {
    const formattedDate = handleFormatDate(props.defaultValue);

    setDate({
      from: formattedDate.from ? formattedDate.from : undefined,
      to: formattedDate.to ? formattedDate.to : undefined,
    });
  });

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
          <DropdownMenuLabel>
            {props?.description ?? 'Selecione a data abaixo'}
          </DropdownMenuLabel>
          {showDeleteButton && (
            <Button variant="ghost" onClick={props.onDelete}>
              <Trash2 size={16} />
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        <div className="flex flex-wrap gap-1 px-2 pb-2">
          {DATE_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                handleChangeDate(preset.getRange());
                open.actions.setValue(false);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <DropdownMenuSeparator />

        <DefaultCalendar
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
