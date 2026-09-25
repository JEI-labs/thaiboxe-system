'use client';

import { EmptyState } from '@/components/emptyState/emptyState.component';
import { ListSkeleton } from '@/components/skeletons/listSkeleton.component';
import React, { useState } from 'react';
import { Edit2Icon, Trash2 } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RowActions } from '@/components/dataTable/rowActions.component';
import { ISupplierList } from './supplierList.types';
import ConfirmDeleteDialog from '../confirmDeleteDialog/confirmDeleteDialog.component';
import { maskCellphone } from '@/utils/masksUtils';

const SuppliersList: React.FC<ISupplierList> = ({
  suppliers,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelId(id);
    setOpen(true);
  };

  const handleConfirm = async (id: string) => {
    await onDelete(id);
    setOpen(false);
    setSelId(null);
  };

  if (isLoading) {
    return <ListSkeleton columns={5} />;
  }

  if (suppliers.length === 0) {
    return (
      <EmptyState
        title="Nenhum fornecedor encontrado"
        description="Ajuste a busca e o filtro de estado, ou cadastre um fornecedor."
      />
    );
  }

  return (
    <>
      <div className="bg-card mt-8 overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead className="w-[70px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {suppliers.map((sup) => (
              <TableRow key={sup.id}>
                <TableCell className="font-medium">{sup.name}</TableCell>

                <TableCell className="text-muted-foreground">
                  {sup.city || sup.state
                    ? [sup.city, sup.state].filter(Boolean).join(', ')
                    : '—'}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {sup.phone ? maskCellphone(sup.phone) : '—'}
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {sup.street || '—'}
                </TableCell>

                <TableCell className="text-right">
                  <RowActions
                    srLabel={`Ações de ${sup.name}`}
                    actions={[
                      {
                        label: 'Editar',
                        icon: Edit2Icon,
                        onSelect: () => onEdit(sup.id),
                      },
                      {
                        label: 'Excluir',
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => handleDeleteClick(sup.id),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selId && (
        <ConfirmDeleteDialog
          item={selId}
          open={open}
          onOpenChange={setOpen}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default SuppliersList;
