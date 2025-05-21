'use client';

import { useState, useEffect } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import Search from '@/components/Search';
import { AppPagination } from '@/components/appPagination/appPagination.component';
import SuppliersList from '@/components/suppliers/supplierList';
import { SheetCreateSupplier } from '@/components/modals/suppliers/createSupplier/createSupplier.component';
import { SheetEditSupplier } from '@/components/modals/suppliers/editSupplier/editSupplier.component';
import { useDebounce } from '@/hooks/useDebounce/useDebounce';

const breadcrumbItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Fornecedores', href: '/suppliers' },
];

export default function SuppliersPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const debounced = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, refetch } = api.supplier.getAll.useQuery({
    page,
    limit,
    search: debounced,
  });

  // reset page on search/limit change
  useEffect(() => setPage(1), [debounced, limit]);

  const deleteMutation = api.supplier.delete.useMutation();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
    await refetch();
  };

  return (
    <div className="w-full pb-[100px]">
      <BreadcrumbUpdater items={breadcrumbItems} />

      <main className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Fornecedores</h1>

        <div className="mt-4 flex items-center justify-between">
          <Search
            className="mr-4 w-1/2"
            placeholder="Buscar fornecedores..."
            onSearch={setSearchTerm}
          />
          <Button onClick={() => setCreateOpen(true)}>Novo fornecedor</Button>
        </div>

        <SuppliersList
          suppliers={data?.data ?? []}
          isLoading={isLoading}
          onEdit={(id) => {
            setEditId(id);
            setEditOpen(true);
          }}
          onDelete={handleDelete}
        />

        <AppPagination
          totalItems={data?.pagination.total ?? 0}
          itemsPerPage={limit}
          currentPage={page}
          onPageChange={setPage}
          onItemsPerPageChange={setLimit}
        />

        {createOpen && (
          <SheetCreateSupplier
            isOpen={createOpen}
            setIsOpen={setCreateOpen}
            refetch={refetch}
          />
        )}
        {editOpen && editId && (
          <SheetEditSupplier
            isOpen={editOpen}
            setIsOpen={setEditOpen}
            supplierId={editId}
            refetch={refetch}
          />
        )}
      </main>
    </div>
  );
}
