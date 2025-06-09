'use client';

import { Suspense, useMemo } from 'react';
// import { api } from '@/trpc/react';
// import { toBase64 } from '@/common/utils/files';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { FinancialSummary } from '@/components/finance/financeSummary/financeSummary.component';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { FinanceEntriesList } from '@/components/finance/financeList.component';
import { Separator } from '@/components/ui/separator';

const breadcrumbItems = [
  {
    label: 'Home',
    href: '/dashboard',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
];

export default function FinanceSummary() {
  const {
    data: entries,
    refetch,
    isLoading,
  } = api.finance.getAll.useQuery({
    page: 1,
    limit: 10,
  });

  // calcula totais de receitas, despesas e saldoo
  const summary = useMemo(() => {
    let incomes = 0;
    let expenses = 0;
    entries?.data.forEach((e) => {
      if (e.type === 'INCOME') incomes += e.amount / 100;
      else expenses += e.amount / 100;
    });
    return { incomes, expenses, net: incomes - expenses };
  }, [entries]);

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="w-full">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <main className="flex flex-col">
          <div className="text-2xl font-semibold">Resumo Financeiro</div>

          <div className="my-4 flex justify-end gap-2">
            <Button size={'sm'}>Filtrar</Button>
            <Button size={'sm'} onClick={() => refetch()}>
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>

          <div className="mb-8">
            <FinancialSummary
              expenses={summary.expenses}
              incomes={summary.incomes}
              net={summary.net}
            />
          </div>

          <Separator />

          <div className="mt-8">
            <FinanceEntriesList
              entries={(entries?.data || []).map((entry) => ({
                ...entry,
                referenceId: entry.referenceId ?? null,
                description: entry.description ?? null,
                paymentMethod: entry.paymentMethod ?? null,
              }))}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </Suspense>
  );
}
