'use client';

import { useState, useEffect } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import CategoriesList from '@/components/categories/categoriesList.component';
import { Button } from '@/components/ui/button';
import { SheetCreateCategory } from '@/components/modals/category/createCategories/createCategories.component';
import { useIsMobile } from '@/hooks/use-mobile';
import { api } from '@/trpc/react';
import Search from '@/components/Search';
import { AppPagination } from '@/components/appPagination/appPagination.component';
import { useDebounce } from '@/hooks/useDebounce/useDebounce';
import { SheetEditCategory } from '@/components/modals/category/editCategory/editCategory.component';
import { AdvancedFilterDatePicker } from '@/components/forms/advancedFilterDatePicker/advancedFilterDatePicker.component';
import { Calendar } from 'lucide-react';
import { AdvancedFilterCheckbox } from '@/components/forms/advancedFilterCheckbox/advancedFilterCheckbox.component';
import { AdvancedFilterCheckboxType } from '@/components/forms/advancedFilterCheckbox/advancedFilterCheckbox.types';
import { ECategoryStatus } from '@prisma/client';

const breadcrumbItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Categorias', href: '/categories' },
];

const STATUS_OPTIONS: Array<AdvancedFilterCheckboxType> = [
  { id: 'ACTIVE', label: 'Ativas' },
  { id: 'INACTIVE', label: 'Inativas' },
];

export default function CategoriesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // filtros adicionais
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const [selectedStatuses, setSelectedStatuses] = useState<
    Array<ECategoryStatus>
  >([]);

  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, refetch } = api.category.getAll.useQuery(
    {
      page,
      limit,
      search: debouncedSearch,
      // só envia status se não for 'ALL'
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      // somente envie as datas se preenchidas
      from: dateFrom || undefined,
      to: dateTo || undefined,
    },
    { staleTime: 5000 }, //5s de cache para evitar requests desnecessários
  );

  const deleteMutation = api.category.delete.useMutation();

  const categories = data?.data ?? [];
  const totalItems = data?.pagination.total ?? 0;

  // sempre volta à página 1 ao mudar busca ou limite
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
    setEditId(null);
    await refetch();
  };

  return (
    <div className="w-full pb-[100px]">
      <BreadcrumbUpdater items={breadcrumbItems} />

      <main className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Categorias</h1>

        <div className="mt-4 flex items-center md:justify-between">
          <Search
            className="mr-4 w-1/2"
            placeholder="Buscar categorias..."
            onSearch={(value) => setSearchTerm(value)}
          />

          <Button onClick={() => setCreateOpen(true)}>Criar categoria</Button>
        </div>

        <h1 className="mt-4 text-lg font-semibold">Filtros</h1>

        <div className="flex gap-2">
          <AdvancedFilterDatePicker
            title="Buscar datas"
            onChange={({ from, to }) => {
              setDateFrom(from ? from.toISOString() : '');
              setDateTo(to ? to.toISOString() : '');
            }}
            description="Data de criação das categorias"
            numberOfMonths={1}
            showDeleteButton={false}
            rightIcon={<Calendar />}
          />

          <AdvancedFilterCheckbox
            title="Status"
            description="Filtrar por status da categoria"
            defaultValue={selectedStatuses.map((status) => ({
              id: status,
              label:
                STATUS_OPTIONS.find((option) => option.id === status)?.label ||
                status,
            }))}
            options={STATUS_OPTIONS}
            onDelete={() => {
              setSelectedStatuses([]);
            }}
            onChange={(next: Array<AdvancedFilterCheckboxType>) => {
              setSelectedStatuses(
                next.map((item) => item.id as ECategoryStatus),
              );
            }}
            showCounterIndicator
            showDeleteButton={false}
          />
        </div>

        <CategoriesList
          categories={categories}
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

        {!isLoading && categories.length === 0 && (
          <div className="flex items-center justify-center p-4 text-lg">
            Nenhuma categoria encontrada
          </div>
        )}

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
          <SheetEditCategory
            isOpen={editOpen}
            side={isMobile ? 'bottom' : 'right'}
            setIsOpen={setEditOpen}
            refetch={refetch}
            categoryId={editId ?? ''}
          />
        )}

        {createOpen && (
          <SheetCreateCategory
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
