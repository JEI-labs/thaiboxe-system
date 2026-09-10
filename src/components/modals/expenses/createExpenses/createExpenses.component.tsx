// components/modals/expenses/createExpenses.component.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';
import { FormSelectComponent } from '@/components/forms/formSelectInput/formSelectInput.component';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/trpc/react';
import {
  createFinanceEntrySchema,
  ICreateFinanceEntry,
  ICreateFinanceEntryInput,
} from '@/server/validations/finance';
import {
  maskDate,
  maskDecimalWithAcronym,
  unmaskDecimal,
} from '@/utils/masksUtils';
import {
  EFinanceEntryStatus,
  EFinanceEntryType,
  EPaymentMethod,
} from '@prisma/client';
import { ICreateExpenses } from './createExpenses.types';

export const SheetCreateExpenseEntry: React.FC<ICreateExpenses> = ({
  side,
  isOpen,
  setIsOpen,
  refetch,
}) => {
  const { toast } = useToast();
  const createEntry = api.finance.create.useMutation();
  const { data: categoriesQuery } = api.category.getAll.useQuery({
    page: 1,
    limit: 100,
  });
  const categories = categoriesQuery?.data ?? [];

  const form = useForm<ICreateFinanceEntryInput, unknown, ICreateFinanceEntry>({
    resolver: zodResolver(createFinanceEntrySchema),
    defaultValues: {
      date: '',
      amount: '0',
      category: '',
      description: '',
      type: EFinanceEntryType.EXPENSE,
      status: EFinanceEntryStatus.PAID,
      paymentMethod: undefined,
      referenceId: '',
      currency: 'BRL',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ICreateFinanceEntry) => {
    try {
      await createEntry.mutateAsync(values);
      toast({ title: 'Sucesso', description: 'Despesa adicionada' });
      form.reset();
      setIsOpen(false);
      refetch?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar despesa';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side={side} className="min-w-[40vw] overflow-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-4"
          >
            <SheetHeader>
              <SheetTitle>Nova Despesa</SheetTitle>
              <SheetDescription>Preencha os dados da despesa</SheetDescription>
            </SheetHeader>
            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <FormInputComponent
                control={form.control}
                name="date"
                label="Data"
                type="text"
                mask={maskDate}
                placeholder="DD/MM/AAAA"
              />
              <FormInputComponent
                control={form.control}
                name="amount"
                label="Valor (R$)"
                type="text"
                mask={maskDecimalWithAcronym}
                unmask={unmaskDecimal}
                placeholder="R$ 0,00"
                maxLength={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelectComponent
                control={form.control}
                name="status"
                label="Status"
                placeholder="Selecione"
                options={[
                  { value: EFinanceEntryStatus.PAID, textValue: 'Pago' },
                  { value: EFinanceEntryStatus.PENDING, textValue: 'Pendente' },
                  {
                    value: EFinanceEntryStatus.CANCELLED,
                    textValue: 'Cancelado',
                  },
                ]}
              />
              <FormSelectComponent
                control={form.control}
                name="paymentMethod"
                label="Forma de Pagamento"
                placeholder="Selecione"
                options={[
                  { value: EPaymentMethod.CASH, textValue: 'Dinheiro' },
                  { value: EPaymentMethod.PIX, textValue: 'Pix' },
                  {
                    value: EPaymentMethod.CREDIT_CARD,
                    textValue: 'Cartão de Crédito',
                  },
                  { value: EPaymentMethod.BOLETO, textValue: 'Boleto' },
                  {
                    value: EPaymentMethod.DEBIT_CARD,
                    textValue: 'Cartão de Débito',
                  },
                ]}
              />
            </div>

            <FormSelectComponent
              control={form.control}
              name="category"
              label="Categoria"
              placeholder="Selecione"
              options={categories.map((cat) => ({
                value: cat.id,
                textValue: cat.name,
              }))}
            />

            <FormInputComponent
              control={form.control}
              name="referenceId"
              label="Referência"
              type="text"
              placeholder="Ex: NF12345"
              mask={(v) => v.toUpperCase()}
              maxLength={20}
            />

            <FormInputComponent
              control={form.control}
              name="description"
              label="Descrição"
              type="text"
              placeholder="Observações"
              maxLength={200}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={createEntry.isPending || form.formState.isSubmitting}
              >
                {createEntry.isPending ? 'Salvando...' : 'Adicionar Despesa'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
