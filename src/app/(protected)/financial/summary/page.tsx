'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { FinancialSummary } from '@/components/finance/financeSummary/financeSummary.component';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { FinanceEntriesList } from '@/components/finance/financeList.component';
import { Separator } from '@/components/ui/separator';
import { useDebounce } from '@/hooks/useDebounce/useDebounce';
import { AdvancedFilterDatePicker } from '@/components/forms/advancedFilterDatePicker/advancedFilterDatePicker.component';
import { Calendar } from 'lucide-react';
import { AppPagination } from '@/components/appPagination/appPagination.component';

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
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [itensPerPage, setItensPerPage] = useState<number>(10);

  const debouncedFrom = useDebounce(dateFrom, 500);
  const debouncedTo = useDebounce(dateTo, 500);

  const {
    data: entries,
    refetch,
    isLoading,
  } = api.finance.getAll.useQuery({
    page: 1,
    limit: 10,
    from: debouncedFrom || undefined,
    to: debouncedTo || undefined,
  });

  const totalItems = entries?.pagination.total ?? 0;

  const summary = useMemo(() => {
    let incomes = 0;
    let expenses = 0;
    entries?.data.forEach((e) => {
      if (e.type === 'INCOME' && e.status === 'PAID') incomes += e.amount / 100;
      else if (e.type === 'EXPENSE' && e.status === 'PAID')
        expenses += e.amount / 100;
    });
    return { incomes, expenses, net: incomes - expenses };
  }, [entries]);

  useEffect(() => {
    refetch();
    setPage(1);
  }, [debouncedFrom, debouncedTo, refetch]);

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="w-full">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <main className="flex flex-col">
          <div className="text-2xl font-semibold">Resumo Financeiro</div>

          {/* filtros */}
          <div className="my-4 flex items-center gap-2">
            <AdvancedFilterDatePicker
              title="Filtrar por data"
              description="Data dos lançamentos"
              numberOfMonths={1}
              showDeleteButton={false}
              rightIcon={<Calendar />}
              onChange={({ from, to }) => {
                setDateFrom(from ? from.toISOString() : '');
                setDateTo(to ? to.toISOString() : '');
              }}
            />

            <div className="my-4 flex justify-end gap-2">
              <Button size={'sm'} onClick={() => refetch()}>
                {isLoading ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
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

          <div className="w-full">
            <AppPagination
              totalItems={totalItems}
              itemsPerPage={itensPerPage}
              currentPage={page}
              onPageChange={(p) => setPage(p)}
              onItemsPerPageChange={(newLimit) => setItensPerPage(newLimit)}
            />
          </div>
        </main>
      </div>
    </Suspense>
  );
}
