'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MdDelete } from 'react-icons/md';
import { Edit2Icon } from 'lucide-react';
import type { IPlanList } from './plansList.types';

const PlansList: React.FC<IPlanList> = ({
  plans,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const handleEdit = (id: string) => {
    onEdit(id);
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
          <p className="py-4 text-center text-muted-foreground">
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
                      <Badge variant="secondary" className="mt-2">
                        R$ {Number(plan.price).toFixed(2)}
                      </Badge>
                    </div>

                    {/* descrição + duração */}
                    <div className="w-full text-sm text-muted-foreground">
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
                        onClick={() => handleDelete(plan.id)}
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
    </div>
  );
};

export default PlansList;
