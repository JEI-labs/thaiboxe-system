'use client';

import { useResetOnChange } from '@/hooks/useResetOnChange/useResetOnChange.hook';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import { ListToolbar } from '@/components/listToolbar/listToolbar.component';
import { AppPagination } from '@/components/appPagination/appPagination.component';
import SuppliersList from '@/components/suppliers/supplierList';
import { SheetCreateSupplier } from '@/components/modals/suppliers/createSupplier/createSupplier.component';
import { SheetEditSupplier } from '@/components/modals/suppliers/editSupplier/editSupplier.component';
import { useDebounce } from '@/hooks/useDebounce/useDebounce';
import { FormSelectComponent } from '@/components/forms/formSelectInput/formSelectInput.component';
import { Form } from '@/components/ui/form';

interface ISupplierForm {
  state: string | null;
}

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

  const [selectedState, setSelectedState] = useState<string | null>(null);

  const { data, isLoading, refetch } = api.supplier.getAll.useQuery({
    page,
    limit,
    search: debounced,
    state: selectedState || undefined,
  });
  const statesOptions = data?.states ?? [];

  // sempre volta à página 1 ao mudar busca ou limite
  useResetOnChange([debounced, limit], () => setPage(1));

  const deleteMutation = api.supplier.delete.useMutation();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
    await refetch();
  };

  const form = useForm<ISupplierForm>({
    defaultValues: {
      state: selectedState,
    },
  });

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    form.setValue('state', value);
    refetch();
  };

  return (
    <div className="w-full">
      <BreadcrumbUpdater items={breadcrumbItems} />

      <main className="flex flex-col gap-4">
        <ListToolbar
          searchPlaceholder="Buscar fornecedores..."
          onSearch={setSearchTerm}
          total={data?.pagination.total}
          totalLabel={['fornecedor', 'fornecedores']}
          action={
            <Button onClick={() => setCreateOpen(true)}>Novo fornecedor</Button>
          }
          filters={
            <Form {...form}>
              <div className="w-56">
                <FormSelectComponent
                  name="state"
                  options={statesOptions
                    .filter(
                      (state): state is string => typeof state === 'string',
                    )
                    .map((state) => ({ value: state, textValue: state }))}
                  placeholder="Estado"
                  onValueChange={handleStateChange}
                  defaultValue={selectedState || ''}
                  disabled={isLoading}
                  control={form.control}
                />
              </div>
            </Form>
          }
        />

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
