// app/financial/revenues/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import Search from '@/components/Search';
import { Button } from '@/components/ui/button';
import { AppPagination } from '@/components/appPagination/appPagination.component';
import { useDebounce } from '@/hooks/useDebounce/useDebounce';
import { useIsMobile } from '@/hooks/use-mobile';
import { api } from '@/trpc/react';
import { SheetCreateFinanceEntry } from '@/components/modals/revenues/createRevenues/createRevenues.component';
import { FinanceEntriesList } from '@/components/finance/financeList.component';

const breadcrumbItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Financeiro', href: '/financial' },
  { label: 'Receitas', href: '/financial/revenues' },
];

export default function RevenuesPage() {
  const isMobile = useIsMobile();
  const [createOpen, setCreateOpen] = useState(false);

  // busca com debounce
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // só receitas (type = 'INCOME')
  const { data, isLoading, refetch } = api.finance.getAll.useQuery(
    { page, limit, search: debouncedSearch, type: 'INCOME' },
    { staleTime: 5000 },
  );

  const entries = data?.data ?? [];
  const totalItems = data?.pagination.total ?? 0;

  // resetar página ao mudar busca ou limite
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  return (
    <Suspense fallback={<div>Carregando receitas…</div>}>
      <div className="w-full gap-6 py-6">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <h1 className="mb-8 text-2xl font-semibold">Lançamentos de Receitas</h1>

        <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Search
            className="w-full md:w-1/3"
            placeholder="Buscar receitas..."
            onSearch={(val) => setSearchTerm(val)}
          />

          <div className="flex gap-2">
            <Button size="sm" onClick={() => refetch()}>
              Filtrar
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              Criar lançamento
            </Button>
          </div>
        </div>

        <FinanceEntriesList entries={entries} isLoading={isLoading} />

        <div className="mt-6">
          <AppPagination
            totalItems={totalItems}
            itemsPerPage={limit}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onItemsPerPageChange={(l) => setLimit(l)}
          />
        </div>

        {createOpen && (
          <SheetCreateFinanceEntry
            side={isMobile ? 'bottom' : 'right'}
            isOpen={createOpen}
            setIsOpen={setCreateOpen}
            refetch={() => refetch()}
          />
        )}
      </div>
    </Suspense>
  );
}
