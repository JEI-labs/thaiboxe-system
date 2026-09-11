'use client';

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

  return (
    <div className="w-full">
      <div className="mt-4">
        <h1 className="text-md font-semibold">Lista de Categorias</h1>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="py-4 text-center">Carregando categorias…</p>
        ) : categories.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center">
            Não foram encontradas categorias.
          </p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="w-[70px] text-right">Ações</TableHead>
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
