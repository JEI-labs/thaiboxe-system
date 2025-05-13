'use client';

import { useState, useEffect } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import CategoriesList from '@/components/categories/categoriesList.component';
import { Button } from '@/components/ui/button';
import { SheetCreateCategory } from '@/components/modals/createCategories/createCategories.component';
import { useIsMobile } from '@/hooks/use-mobile';
import { api } from '@/trpc/react';
import Search from '@/components/Search';
import { AppPagination } from '@/components/appPagination/appPagination.component';
import { useDebounce } from '@/hooks/useDebounce/useDebounce';

const breadcrumbItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Categorias', href: '/categories' },
];

export default function CategoriesPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, refetch } = api.category.getAll.useQuery(
    { page, limit, search: debouncedSearch },
    { staleTime: 5000 },
  );

  const categories = data?.data ?? [];
  const totalItems = data?.pagination.total ?? 0;

  // sempre volta à página 1 ao mudar busca ou limite
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  return (
    <div className="w-full">
      <BreadcrumbUpdater items={breadcrumbItems} />

      <main className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Categorias</h1>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Search
            className="mr-4"
            placeholder="Buscar categorias..."
            onSearch={(value) => setSearchTerm(value)}
          />

          <Button size="sm" onClick={() => setCreateOpen(true)}>
            Criar categoria
          </Button>
        </div>

        <div className="mt-2">
          <CategoriesList categories={categories} isLoading={isLoading} />
        </div>

        <div>
          <AppPagination
            totalItems={totalItems}
            itemsPerPage={limit}
            currentPage={page}
            onPageChange={(p) => setPage(p)}
            onItemsPerPageChange={(newLimit) => setLimit(newLimit)}
          />
        </div>

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
