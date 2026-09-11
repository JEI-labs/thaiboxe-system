'use client';

import { EmptyState } from '@/components/emptyState/emptyState.component';
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
import type { IPlanList } from './plansList.types';
import ConfirmDeleteDialog from '../confirmDeleteDialog/confirmDeleteDialog.component';

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const PlansList: React.FC<IPlanList> = ({
  plans,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

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
        <h1 className="text-md font-semibold">Planos</h1>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="py-4 text-center">Carregando planos…</p>
        ) : plans.length === 0 ? (
          <EmptyState
            title="Nenhum plano encontrado"
            description="Ajuste a busca, ou crie o primeiro plano de matrícula."
          />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead className="text-right">Parcela</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-[70px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>

                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {plan.description || '—'}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {plan.duration} {plan.duration === 1 ? 'mês' : 'meses'}
                    </TableCell>

                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        R$ {Number(plan.price).toFixed(2)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDate(plan.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <RowActions
                        srLabel={`Ações do plano ${plan.name}`}
                        actions={[
                          {
                            label: 'Editar',
                            icon: Edit2Icon,
                            onSelect: () => onEdit(plan.id),
                          },
                          {
                            label: 'Excluir',
                            icon: Trash2,
                            destructive: true,
                            onSelect: () => handleDeleteClick(plan.id),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
