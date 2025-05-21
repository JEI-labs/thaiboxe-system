// components/confirmDeleteDialog/ConfirmDeleteDialog.tsx
'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { IConfirmDeleteDialog } from './confirmDeleteDialog.types';

export default function ConfirmDeleteDialog({
  item,
  open,
  onOpenChange,
  onConfirm,
}: IConfirmDeleteDialog<string>) {
  const [loading, setLoading] = useState(false);

  const handleOpenChange = (val: boolean) => {
    if (!loading) {
      onOpenChange(val);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(item);
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {/* Opcional: se precisar de um trigger interno
      <AlertDialogTrigger asChild>
        <button>Excluir</button>
      </AlertDialogTrigger>
      */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja excluir este item? Esta ação não pode ser
            desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
