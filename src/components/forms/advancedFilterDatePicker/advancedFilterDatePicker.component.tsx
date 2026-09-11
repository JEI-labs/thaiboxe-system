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
export const DATE_PRESETS: Array<{
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

/** Período padrão das telas com filtro de data. */
export const getDefaultDateRange = (): { from: Date; to: Date } => ({
  from: moment().subtract(29, 'days').startOf('day').toDate(),
  to: moment().endOf('day').toDate(),
});

const toKey = (date?: Date) => (date ? moment(date).format('YYYY-MM-DD') : '');

/**
 * Rótulo do botão: nome do atalho quando o intervalo bate com um deles,
 * senão as datas mesmo — assim dá para saber o que está sendo puxado sem
 * abrir o menu.
 */
const describeRange = (
  range: AdvancedFilterDatePickerType | undefined,
  fallback: string,
): string => {
  if (!range?.from && !range?.to) return fallback;

  const preset = DATE_PRESETS.find((item) => {
    const candidate = item.getRange();
    return (
      toKey(candidate.from) === toKey(range?.from) &&
      toKey(candidate.to) === toKey(range?.to)
    );
  });
  if (preset) return preset.label;

  const from = range?.from ? moment(range.from).format('DD/MM/YY') : '';
  const to = range?.to ? moment(range.to).format('DD/MM/YY') : '';
  if (from && to) return from === to ? from : `${from} – ${to}`;
  return from || to || fallback;
};

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
          {describeRange(date, props.title)}
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

        {/* w-0 + min-w-full: com largura 0 os atalhos não entram no cálculo
            de largura do dropdown (que passa a ser o do calendário) e só
            depois esticam para 100%, rolando na horizontal em vez de
            empurrar o menu ou quebrar em várias linhas */}
        <div className="w-0 min-w-full overflow-x-auto px-2 pb-2">
          <div className="flex w-max gap-1">
            {DATE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 shrink-0 px-2 text-xs"
                onClick={() => {
                  handleChangeDate(preset.getRange());
                  open.actions.setValue(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
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
