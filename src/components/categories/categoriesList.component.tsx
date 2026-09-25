'use client';

import { EmptyState } from '@/components/emptyState/emptyState.component';
import { ListSkeleton } from '@/components/skeletons/listSkeleton.component';
import React, { useState } from 'react';
import { Edit2Icon, Trash2 } from 'lucide-react';

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
import type { ICategoryList } from './categoryList.types';
import ConfirmDeleteDialog from '../confirmDeleteDialog/confirmDeleteDialog.component';

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

export const CategoriesList: React.FC<ICategoryList> = ({
  categories,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const handleDeleteClick = (id: string) => {
    setSelectedCategoryId(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (id: string) => {
    await onDelete(id);
    setOpenDeleteDialog(false);
    setSelectedCategoryId(null);
  };

  /* Sem nenhuma categoria editável na página, a coluna de ações fica vazia
     — é o caso de quem só tem a categoria fixa do sistema. */
  const hasActions = categories.some((cat) => !cat.isFixed);

  return (
    <div className="w-full">
      <div className="mt-4">
        {isLoading ? (
          <ListSkeleton columns={5} />
        ) : categories.length === 0 ? (
          <EmptyState
            title="Nenhuma categoria encontrada"
            description="Ajuste a busca e os filtros, ou crie a primeira categoria."
          />
        ) : (
          <div className="bg-card shadow-card overflow-hidden rounded-2xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  {hasActions && (
                    <TableHead className="w-[70px] text-right">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {cat.name}
                        {cat.isFixed && (
                          <Badge variant="outline" className="font-normal">
                            Fixa do sistema
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {cat.description || '—'}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          cat.status === 'ACTIVE' ? 'success' : 'destructive'
                        }
                      >
                        {cat.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDate(cat.createdAt)}
                    </TableCell>

                    {hasActions && (
                      <TableCell className="text-right">
                        {/* categorias fixas do sistema não podem ser alteradas;
                            sem ações, RowActions não renderiza nada */}
                        <RowActions
                          srLabel={`Ações da categoria ${cat.name}`}
                          actions={
                            cat.isFixed
                              ? []
                              : [
                                  {
                                    label: 'Editar',
                                    icon: Edit2Icon,
                                    onSelect: () => onEdit(cat.id),
                                  },
                                  {
                                    label: 'Excluir',
                                    icon: Trash2,
                                    destructive: true,
                                    onSelect: () => handleDeleteClick(cat.id),
                                  },
                                ]
                          }
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {selectedCategoryId && (
        <ConfirmDeleteDialog
          item={selectedCategoryId}
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default CategoriesList;
