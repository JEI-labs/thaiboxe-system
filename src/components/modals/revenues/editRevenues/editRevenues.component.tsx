import React, { useEffect } from 'react';
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
} from '@/server/validations/finance';
import {
  maskDate,
  maskDecimalWithAcronym,
  unmaskDecimal,
} from '@/utils/masksUtils';
import { format } from 'date-fns';
import { IEditRevenues } from './editRevenues.types';
import { EFinanceEntryStatus, EPaymentMethod } from '@prisma/client';

export const SheetEditFinanceEntry: React.FC<IEditRevenues> = ({
  side,
  isOpen,
  setIsOpen,
  entry,
  refetch,
}) => {
  const { toast } = useToast();

  const updateEntry = api.finance.update.useMutation();
  const { data: categories } = api.category.getAll.useQuery({});

  const form = useForm<ICreateFinanceEntry>({
    resolver: zodResolver(createFinanceEntrySchema),
    defaultValues: {
      date: format(new Date(entry.date), 'dd/MM/yyyy'),
      amount: entry.amount.toString(),
      category: entry.category,
      description: entry.description || '',
      type: entry.type,
      status: entry.status,
      paymentMethod: entry.paymentMethod || undefined,
      referenceId: entry.referenceId || '',
      currency: entry.currency || 'BRL',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset({
      date: format(new Date(entry.date), 'dd/MM/yyyy'),
      amount: entry.amount.toString(),
      category: entry.category,
      description: entry.description || '',
      type: entry.type,
      status: entry.status,
      paymentMethod: entry.paymentMethod || undefined,
      referenceId: entry.referenceId || '',
      currency: entry.currency || 'BRL',
    });
  }, [entry, form]);

  const onSubmit = async (values: ICreateFinanceEntry) => {
    try {
      await updateEntry.mutateAsync({ id: entry.id, ...values });
      toast({
        title: 'Sucesso',
        description: 'Lançamento atualizado com sucesso',
      });
      setIsOpen(false);
      form.reset();
      refetch?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar';
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
              <SheetTitle>Editar Lançamento</SheetTitle>
              <SheetDescription>Altere os dados do lançamento</SheetDescription>
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
              options={
                categories?.data.map((category) => ({
                  value: category.id,
                  textValue: category.name,
                })) ?? []
              }
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
                disabled={updateEntry.isPending || form.formState.isSubmitting}
              >
                {updateEntry.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
