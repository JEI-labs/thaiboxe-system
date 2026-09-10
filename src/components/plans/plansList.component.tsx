'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MdDelete } from 'react-icons/md';
import { Edit2Icon } from 'lucide-react';
import type { IPlanList } from './plansList.types';
import ConfirmDeleteDialog from '../confirmDeleteDialog/confirmDeleteDialog.component';

const PlansList: React.FC<IPlanList> = ({
  plans,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    onEdit(id);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedPlanId(id);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async (id: string) => {
    await onDelete(id);
    setOpenDeleteDialog(false);
    setSelectedPlanId(null);
  };

  return (
    <div className="w-full">
      <div className="mt-4">
        <h1 className="text-md font-semibold">Lista de Planos</h1>
      </div>

      <div className="mt-4 p-0">
        {isLoading ? (
          <p className="py-4 text-center">Carregando planos…</p>
        ) : plans.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center">
            Não foram encontrados planos.
          </p>
        ) : (
          <ScrollArea className="h-full w-full overflow-auto">
            <div className="space-y-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="overflow-hidden rounded-lg border"
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* título + preço */}
                    <div className="flex w-full items-center justify-between break-words">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <div className="flex flex-col items-center">
                        <span className="text-muted-foreground mb-1 text-xs">
                          Valor da parcela do plano
                        </span>
                        <Badge variant="secondary">
                          R$ {Number(plan.price).toFixed(2)}
                        </Badge>
                      </div>
                    </div>

                    {/* descrição + duração */}
                    <div className="text-muted-foreground w-full text-sm">
                      {plan.description && (
                        <p className="break-words">
                          <span className="font-semibold">Descrição: </span>
                          {plan.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs">
                        Duração: {plan.duration}{' '}
                        {plan.duration === 1 ? 'mês' : 'meses'}
                      </p>
                      <p className="mt-1 text-xs">
                        Criado em:{' '}
                        {new Date(plan.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* botões */}
                    <div className="flex w-full justify-end gap-2 sm:justify-end">
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => handleEdit(plan.id)}
                      >
                        <Edit2Icon size={18} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteClick(plan.id)}
                      >
                        <MdDelete size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {selectedPlanId && (
        <ConfirmDeleteDialog
          item={selectedPlanId}
          open={openDeleteDialog}
          onOpenChange={setOpenDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default PlansList;
