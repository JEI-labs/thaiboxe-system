'use client';

import { useState, useEffect } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { api } from '@/trpc/react';
import Search from '@/components/Search';
import { AppPagination } from '@/components/appPagination/appPagination.component';
import { useDebounce } from '@/hooks/useDebounce/useDebounce';
import PlansList from '@/components/plans/plansList.component';
import { SheetEditPlan } from '@/components/modals/plans/editPlan/sheetEditPlan.component';
import { SheetCreatePlan } from '@/components/modals/plans/createPlan/sheetCreatePlan.component';
import { toast } from '@/hooks/use-toast';

const breadcrumbItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Planos', href: '/plans' },
];

export default function PlansPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, refetch } = api.plans.getAll.useQuery({
    page,
    limit,
    search: debouncedSearch,
  });

  const deleteMutation = api.plans.delete.useMutation();

  const plans = data?.data ?? [];
  const totalItems = data?.pagination.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
    setEditId(null);
    await refetch();
    toast({
      title: 'Sucesso',
      description: 'Plano deletado com sucesso',
    });
  };

  return (
    <div className="w-full pb-[100px]">
      <BreadcrumbUpdater items={breadcrumbItems} />

      <main className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Planos</h1>

        <div className="mt-4 flex items-center md:justify-between">
          <Search
            className="mr-4 w-1/2"
            placeholder="Buscar planos..."
            onSearch={(value) => setSearchTerm(value)}
          />

          <Button onClick={() => setCreateOpen(true)}>Criar plano</Button>
        </div>

        <PlansList
          plans={plans}
          isLoading={isLoading}
          onEdit={(id) => {
            setEditId(id);
            setEditOpen(true);
          }}
          onDelete={(id) => {
            handleDelete(id);
            refetch();
          }}
        />

        <div className="w-full">
          <AppPagination
            totalItems={totalItems}
            itemsPerPage={limit}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onItemsPerPageChange={(newLimit) => setLimit(newLimit)}
          />
        </div>

        {editOpen && (
          <SheetEditPlan
            isOpen={editOpen}
            side={isMobile ? 'bottom' : 'right'}
            setIsOpen={setEditOpen}
            refetch={refetch}
            planId={editId ?? ''}
          />
        )}

        {createOpen && (
          <SheetCreatePlan
            isOpen={createOpen}
            side={isMobile ? 'bottom' : 'right'}
            setIsOpen={setCreateOpen}
            refetch={refetch}
          />
        )}
      </main>
    </div>
  );
}
