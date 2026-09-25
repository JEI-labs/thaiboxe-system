'use client';

import { useState } from 'react';

import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { Button } from '@/components/ui/button';
import { AppPagination } from '@/components/appPagination/appPagination.component';
import { ListToolbar } from '@/components/listToolbar/listToolbar.component';
import { PromotionsList } from '@/components/promotions/promotionsList.component';
import { SavePromotion } from '@/components/modals/promotions/savePromotion/savePromotion.component';
import { useDebounce } from '@/hooks/useDebounce/useDebounce';
import { useResetOnChange } from '@/hooks/useResetOnChange/useResetOnChange.hook';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/trpc/react';

const breadcrumbItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Promoções', href: '/registrations/promotions' },
];

export default function PromotionsPage() {
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useResetOnChange([debouncedSearch, limit], () => setPage(1));

  const { data, isLoading, refetch } = api.promotion.getAll.useQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = api.promotion.delete.useMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: 'Promoção excluída' });
      await refetch();
    } catch {
      toast({ title: 'Erro ao excluir promoção', variant: 'destructive' });
    }
  };

  const totalItems = data?.pagination.total ?? 0;

  return (
    <div className="w-full">
      <BreadcrumbUpdater items={breadcrumbItems} />

      <main className="flex flex-col gap-4">
        <ListToolbar
          searchPlaceholder="Buscar promoções..."
          onSearch={setSearchTerm}
          total={totalItems}
          totalLabel={['promoção', 'promoções']}
          action={
            <Button onClick={() => setCreateOpen(true)}>Criar promoção</Button>
          }
        />

        <PromotionsList
          promotions={data?.data ?? []}
          isLoading={isLoading}
          onEdit={setEditId}
          onDelete={handleDelete}
        />

        {totalItems > 0 && (
          <div className="w-full">
            <AppPagination
              totalItems={totalItems}
              itemsPerPage={limit}
              currentPage={page}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
            />
          </div>
        )}
      </main>

      <SavePromotion
        isOpen={createOpen}
        setIsOpen={setCreateOpen}
        refetch={refetch}
      />

      <SavePromotion
        isOpen={Boolean(editId)}
        setIsOpen={(open) => !open && setEditId(null)}
        promotionId={editId}
        refetch={refetch}
      />
    </div>
  );
}
