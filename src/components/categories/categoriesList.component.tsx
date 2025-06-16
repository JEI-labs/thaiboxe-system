'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ICategoryList } from './categoryList.types';
import { Button } from '@/components/ui/button';
import { MdDelete } from 'react-icons/md';
import { Edit2Icon } from 'lucide-react';
import ConfirmDeleteDialog from '../confirmDeleteDialog/confirmDeleteDialog.component';

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

  const handleEdit = (id: string) => onEdit(id);

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

      <div className="mt-4 p-0">
        {isLoading ? (
          <p className="py-4 text-center">Carregando categorias…</p>
        ) : categories.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">
            Não foram encontradas categorias.
          </p>
        ) : (
          <ScrollArea className="h-full w-full overflow-auto">
            <div className="space-y-2">
              {categories.map((cat) =>
                cat.isFixed ? (
                  <div
                    key={cat.id}
                    className="mb-8 overflow-hidden rounded-lg border bg-muted/50"
                  >
                    <div className="p-2">
                      <span className="text-sm text-muted-foreground">
                        Categoria fixa do sistema
                      </span>
                    </div>

                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex w-full items-center justify-between break-words">
                        <h3 className="text-lg font-semibold">{cat.name}</h3>
                        <Badge
                          variant={
                            cat.status === 'ACTIVE' ? 'success' : 'destructive'
                          }
                          className="mt-2"
                        >
                          {cat.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={cat.id}
                    className="overflow-hidden rounded-lg border"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex w-full items-center justify-between break-words">
                        <h3 className="text-lg font-semibold">{cat.name}</h3>
                        <Badge
                          variant={
                            cat.status === 'ACTIVE' ? 'success' : 'destructive'
                          }
                          className="mt-2"
                        >
                          {cat.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>

                      {/* botões */}
                      <div className="flex w-full justify-end gap-2 sm:justify-end">
                        <Button
                          variant="default"
                          size="icon"
                          onClick={() => handleEdit(cat.id)}
                        >
                          <Edit2Icon size={18} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(cat.id)}
                        >
                          <MdDelete size={18} />
                        </Button>
                      </div>
                    </div>

                    {/* descrição + data */}
                    <div className="w-full px-4 pb-4 pt-0 text-sm text-muted-foreground">
                      {cat.description && (
                        <p className="break-words">
                          <span className="font-semibold">Descrição: </span>
                          {cat.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs">
                        <span className="text-sm font-semibold">
                          Criada em:&nbsp;
                        </span>
                        {new Date(cat.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </ScrollArea>
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
