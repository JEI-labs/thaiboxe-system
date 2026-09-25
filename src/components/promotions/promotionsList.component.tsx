'use client';

import React, { useState } from 'react';
import { Edit2Icon, Trash2 } from 'lucide-react';
import type { Promotion } from '@prisma/client';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RowActions } from '@/components/dataTable/rowActions.component';
import { EmptyState } from '@/components/emptyState/emptyState.component';
import { ListSkeleton } from '@/components/skeletons/listSkeleton.component';
import ConfirmDeleteDialog from '../confirmDeleteDialog/confirmDeleteDialog.component';

interface PromotionsListProps {
  promotions: Array<Promotion>;
  isLoading: boolean;
  onEdit: (_id: string) => void;
  onDelete: (_id: string) => Promise<void> | void;
}

const formatDate = (value: Date | string | null) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '—';

export function formatDiscount(promotion: Promotion): string {
  return promotion.discountType === 'PERCENTAGE'
    ? `${promotion.discountValue}%`
    : Number(promotion.discountValue).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
}

export function PromotionsList({
  promotions,
  isLoading,
  onEdit,
  onDelete,
}: PromotionsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return <ListSkeleton columns={5} />;
  }

  if (promotions.length === 0) {
    return (
      <EmptyState
        title="Nenhuma promoção encontrada"
        description="Crie uma promoção para aplicar desconto no registro de pagamentos."
      />
    );
  }

  return (
    <>
      <div className="bg-card shadow-card overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Promoção</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Início</TableHead>
              <TableHead>Fim</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-[70px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {promotions.map((promotion) => (
              <TableRow key={promotion.id}>
                <TableCell>
                  <p className="font-medium">{promotion.name}</p>
                  {promotion.description && (
                    <p className="text-muted-foreground max-w-xs truncate text-xs">
                      {promotion.description}
                    </p>
                  )}
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">{formatDiscount(promotion)}</Badge>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {formatDate(promotion.startsAt)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(promotion.endsAt)}
                </TableCell>

                <TableCell>
                  <Badge variant={promotion.isActive ? 'success' : 'secondary'}>
                    {promotion.isActive ? 'Ativa' : 'Inativa'}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <RowActions
                    srLabel={`Ações da promoção ${promotion.name}`}
                    actions={[
                      {
                        label: 'Editar',
                        icon: Edit2Icon,
                        onSelect: () => onEdit(promotion.id),
                      },
                      {
                        label: 'Excluir',
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => setDeleteId(promotion.id),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {deleteId && (
        <ConfirmDeleteDialog
          item={deleteId}
          open={Boolean(deleteId)}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={async (id) => {
            await onDelete(id);
            setDeleteId(null);
          }}
        />
      )}
    </>
  );
}
