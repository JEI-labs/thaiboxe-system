'use client';

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MdDelete } from 'react-icons/md';
import { Edit2Icon } from 'lucide-react';
import { ISupplierList } from './supplierList.types';
import ConfirmDeleteDialog from '../confirmDeleteDialog/confirmDeleteDialog.component';

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
    return <p className="py-4 text-center">Carregando fornecedores…</p>;
  }

  if (suppliers.length === 0) {
    return (
      <p className="py-4 text-center text-muted-foreground">
        Nenhum fornecedor encontrado.
      </p>
    );
  }

  return (
    <>
      <ScrollArea className="mt-8 h-full w-full overflow-auto">
        <div className="space-y-2">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <h3 className="text-lg font-semibold">{sup.name}</h3>
                {(sup.city || sup.state) && (
                  <p className="text-sm text-muted-foreground">
                    {sup.city}, {sup.state}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => onEdit(sup.id)}
                >
                  <Edit2Icon size={18} />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteClick(sup.id)}
                >
                  <MdDelete size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

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
