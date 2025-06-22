import React, { useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { IFinanceEntriesList } from './financeList.types';
import { api } from '@/trpc/react';
import { maskDecimalWithAcronym } from '@/utils/masksUtils';
import { Trash2, Edit2 } from 'lucide-react';
import ConfirmDeleteDialog from '../confirmDeleteDialog/confirmDeleteDialog.component';
import { EFinanceEntryStatus, EFinanceEntryType } from '@prisma/client';

export const FinanceEntriesList: React.FC<IFinanceEntriesList> = ({
  entries,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const { data: categoriesData, isLoading: isLoadingCategories } =
    api.category.getAll.useQuery({ page: 1, limit: 50 });

  const loading = isLoading || isLoadingCategories;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    if (onDelete) await onDelete(id);
  };

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Lista de Lançamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-full w-full">
          <div className="space-y-4">
            {loading ? (
              <p className="py-4 text-center">Carregando lançamentos…</p>
            ) : entries.length > 0 ? (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-lg ${
                    entry.type === EFinanceEntryType.STUDENTS
                      ? 'border-l-4 border-blue-600'
                      : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="mb-4 flex items-center gap-2">
                      <Badge
                        variant={
                          entry.type === EFinanceEntryType.EXPENSE
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {entry.type === EFinanceEntryType.INCOME
                          ? 'Receita'
                          : entry.type === EFinanceEntryType.STUDENTS
                            ? 'Receita de Aluno'
                            : 'Despesa'}
                      </Badge>
                      <Badge variant="outline">
                        {entry.status === EFinanceEntryStatus.PAID
                          ? 'Pago'
                          : entry.status === EFinanceEntryStatus.PENDING
                            ? 'Pendente'
                            : 'Cancelado'}
                      </Badge>
                    </div>

                    <p className="text-lg font-semibold">
                      {categoriesData?.data.find(
                        (c) => c.id === entry.categoryId,
                      )?.name ?? '-'}
                    </p>

                    <div className="flex flex-col">
                      {entry.type === EFinanceEntryType.STUDENTS &&
                        entry.student?.name && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span>Aluno:</span>
                            <p className="text-sm text-muted-foreground">
                              {entry.student.name}
                            </p>
                          </div>
                        )}
                      {entry.referenceId && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span>Ref:</span>
                          <p className="text-sm text-muted-foreground">
                            {entry.referenceId}
                          </p>
                        </div>
                      )}
                      {entry.description && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-sm">Descrição:</span>
                          <p className="text-sm text-muted-foreground">
                            {entry.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        entry.type === EFinanceEntryType.EXPENSE
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {entry.type === EFinanceEntryType.EXPENSE ? '- ' : '+ '}
                      {maskDecimalWithAcronym(entry.amount)}
                    </p>
                    {entry.paymentMethod && (
                      <p className="text-xs uppercase text-muted-foreground">
                        {entry.paymentMethod.replace(/_/g, ' ')}
                      </p>
                    )}

                    <div className="mt-2 flex gap-2">
                      {onEdit && (
                        <Button
                          variant="default"
                          size="icon"
                          onClick={() => onEdit(entry.id)}
                        >
                          <Edit2 size={16} />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(entry.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-muted-foreground">
                Ainda não há lançamentos financeiros.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {onDelete && (
        <ConfirmDeleteDialog
          item={selectedId!}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};
