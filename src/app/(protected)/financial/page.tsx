'use client';

import { Suspense, useMemo } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/trpc/react';
import { maskDate } from '@/utils/masksUtils';
import {
  createFinanceEntrySchema,
  ICreateFinanceEntry,
} from '@/server/validations/finance';

const breadcrumbItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Financeiro', href: '/financial' },
];

export default function FinancialPage() {
  const { toast } = useToast();
  const { data: entries, refetch } = api.finance.getAll.useQuery();
  const createEntry = api.finance.create.useMutation();

  const form = useForm<ICreateFinanceEntry>({
    resolver: zodResolver(createFinanceEntrySchema),
    defaultValues: {
      date: '',
      amount: 0,
      category: '',
      description: '',
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
      form.reset();
      refetch();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao criar lançamento';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
    }
  };

  // calcula total de receita
  const totalRevenue = useMemo(() => {
    return entries?.data.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  }, [entries]);

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="w-full space-y-8 p-6">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <h1 className="text-2xl font-semibold">Financeiro da Academia</h1>

        {/* Sumário financeiro */}
        <div className="flex justify-between rounded bg-muted p-4">
          <span className="font-medium">Receita Total</span>
          <span className="font-bold text-green-600">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Formulário de lançamento */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-4 items-end gap-4"
          >
            <div className="col-span-1">
              <FormInputComponent
                control={form.control}
                name="date"
                label="Data"
                type="text"
                mask={maskDate}
                placeholder="DD/MM/AAAA"
              />
            </div>

            <div className="col-span-1">
              <FormInputComponent
                control={form.control}
                name="amount"
                label="Valor (R$)"
                type="number"
                placeholder="0.00"
              />
            </div>

            <div className="col-span-1">
              <FormInputComponent
                control={form.control}
                name="category"
                label="Categoria"
                type="text"
                placeholder="Mensalidade, Aula Avulsa..."
              />
            </div>

            <div className="col-span-1">
              <FormInputComponent
                control={form.control}
                name="description"
                label="Descrição"
                type="text"
                placeholder="Observações (ex: Plano gold)"
              />
            </div>

            <div className="col-span-4 flex justify-end">
              <Button
                type="submit"
                disabled={createEntry.isLoading || form.formState.isSubmitting}
              >
                {createEntry.isLoading ? 'Salvando...' : 'Adicionar Lançamento'}
              </Button>
            </div>
          </form>
        </Form>

        <Separator />

        {/* Lista de lançamentos */}
        <div className="space-y-2">
          {entries?.data.length ? (
            entries.data.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded border p-4"
              >
                <div>
                  <span className="font-medium">{entry.category}</span>
                  <p className="text-sm text-muted-foreground">
                    {entry.description}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm">{entry.date}</span>
                  <span className="font-semibold text-green-600">
                    R$ {entry.amount.toFixed(2).replace('.', ',')}
                  </span>
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
