'use client';

import { Suspense, useMemo } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';

import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/trpc/react';
import {
  maskDate,
  maskDecimalWithAcronym,
  unmaskDecimal,
} from '@/utils/masksUtils';
import {
  createFinanceEntrySchema,
  ICreateFinanceEntry,
} from '@/server/validations/finance';
import { FormSelectComponent } from '@/components/forms/formSelectInput/formSelectInput.component';

const breadcrumbItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Financeiro', href: '/financial' },
];

export default function ExpensesPage() {
  const { toast } = useToast();
  const { data: entries, refetch } = api.finance.getAll.useQuery({
    page: 1,
    limit: 10,
    type: 'EXPENSE',
  });
  const createEntry = api.finance.create.useMutation();

  const form = useForm<ICreateFinanceEntry>({
    resolver: zodResolver(createFinanceEntrySchema),
    defaultValues: {
      date: '',
      amount: '0',
      category: '',
      description: '',
      type: 'INCOME',
      status: 'PENDING',
      paymentMethod: undefined,
      referenceId: '',
      currency: 'BRL',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ICreateFinanceEntry) => {
    try {
      await createEntry.mutateAsync(values);
      toast({
        title: 'Sucesso',
        description: 'Lançamento financeiro adicionado',
        variant: 'default',
      });
      form.reset(undefined, { keepValues: false });
      refetch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar lançamento';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    }
  };

  // calcula totais de receitas, despesas e saldo
  const summary = useMemo(() => {
    let incomes = 0;
    let expenses = 0;
    entries?.data.forEach((e) => {
      if (e.type === 'INCOME') incomes += e.amount;
      else expenses += e.amount;
    });
    return { incomes, expenses, net: incomes - expenses };
  }, [entries]);

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="w-full gap-6 py-6">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <h1 className="mb-8 text-2xl font-semibold">Financeiro</h1>

        {/* Resumo financeiro */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded bg-muted p-4">
            <span className="block">Total de Receitas</span>
            <span className="font-bold text-green-600">
              R$ {summary.incomes.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="rounded bg-muted p-4">
            <span className="block">Total de Despesas</span>
            <span className="font-bold text-destructive">
              R$ {summary.expenses.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="rounded bg-muted p-4">
            <span className="block">Saldo</span>
            <span
              className={`font-bold ${
                summary.net >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {summary.net >= 0 ? 'R$ ' : '-R$ '}
              {Math.abs(summary.net).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <Separator />

        {/* Formulário de lançamento */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 grid grid-cols-6 items-end gap-4"
          >
            <div className="col-span-3">
              <FormInputComponent
                control={form.control}
                name="date"
                label="Data"
                type="text"
                mask={maskDate}
                placeholder="DD/MM/AAAA"
              />
            </div>
            <div className="col-span-3">
              <FormInputComponent
                control={form.control}
                name="amount"
                label="Valor (R$)"
                type="text"
                mask={maskDecimalWithAcronym}
                unmask={unmaskDecimal}
                maxLength={10}
                placeholder="0.00"
              />
            </div>
            <div className="col-span-2">
              <FormSelectComponent
                control={form.control}
                name="type"
                label="Tipo"
                placeholder="Selecione"
                options={[
                  { value: 'INCOME', textValue: 'Receita' },
                  { value: 'EXPENSE', textValue: 'Despesa' },
                ]}
              />
            </div>
            <div className="col-span-2">
              <FormSelectComponent
                control={form.control}
                name="status"
                label="Status"
                placeholder="Selecione"
                options={[
                  { value: 'PAID', textValue: 'Pago' },
                  { value: 'PENDING', textValue: 'Pendente' },
                  { value: 'CANCELED', textValue: 'Cancelado' },
                ]}
              />
            </div>
            <div className="col-span-2">
              <FormSelectComponent
                control={form.control}
                name="paymentMethod"
                label="Forma de Pagamento"
                placeholder="Selecione"
                options={[
                  { value: 'CASH', textValue: 'Dinheiro' },
                  { value: 'PIX', textValue: 'Pix' },
                  { value: 'CARD', textValue: 'Cartão' },
                  { value: 'BANK_SLIP', textValue: 'Boleto' },
                ]}
              />
            </div>
            <div className="col-span-1">
              <FormInputComponent
                control={form.control}
                name="category"
                label="Categoria"
                type="text"
                placeholder="Ex: Mensalidade"
                maxLength={50}
              />
            </div>

            <div className="col-span-2">
              <FormInputComponent
                control={form.control}
                name="referenceId"
                label="Referência"
                type="text"
                placeholder="Ex: NF12345"
                maxLength={20}
              />
            </div>
            <div className="col-span-3">
              <FormInputComponent
                control={form.control}
                name="description"
                label="Descrição"
                type="text"
                placeholder="Observações"
                maxLength={200}
              />
            </div>

            <div className="col-span-6 my-8 flex justify-end">
              <Button
                type="submit"
                disabled={createEntry.isPending || form.formState.isSubmitting}
              >
                {createEntry.isPending ? 'Salvando...' : 'Adicionar Lançamento'}
              </Button>
            </div>
          </form>
        </Form>

        <Separator />

        {/* Lista de lançamentos */}
        <div className="mt-8 gap-4">
          {entries?.data.length ? (
            entries.data.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        entry.type === 'INCOME' ? 'default' : 'destructive'
                      }
                    >
                      {entry.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </Badge>
                    <Badge variant="outline">
                      {entry.status === 'PAID'
                        ? 'Pago'
                        : entry.status === 'PENDING'
                          ? 'Pendente'
                          : 'Cancelado'}
                    </Badge>
                  </div>
                  <span className="font-medium">{entry.categoryId}</span>
                  {entry.referenceId && (
                    <span className="text-sm text-muted-foreground">
                      Ref: {entry.referenceId}
                    </span>
                  )}
                  {entry.description && (
                    <p className="text-sm text-muted-foreground">
                      {entry.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm">
                    {entry.date.toLocaleDateString()}
                  </span>
                  <span
                    className={`font-semibold ${
                      entry.type === 'INCOME'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {entry.type === 'INCOME' ? '+ ' : '- '}
                    R$ {entry.amount.toFixed(2).replace('.', ',')}
                  </span>
                  {entry.paymentMethod && (
                    <span className="text-xs uppercase text-muted-foreground">
                      {entry.paymentMethod.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Ainda não há lançamentos financeiros.
            </p>
          )}
        </div>
      </div>
    </Suspense>
  );
}
