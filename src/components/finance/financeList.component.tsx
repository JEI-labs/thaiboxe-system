import React from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IFinanceEntriesList } from './financeList.types';
import { api } from '@/trpc/react';
import { maskDecimalWithAcronym } from '@/utils/masksUtils';

export const FinanceEntriesList: React.FC<IFinanceEntriesList> = ({
  entries,
  isLoading,
}) => {
  const { data: categoriesData, isLoading: isLoadingCategories } =
    api.category.getAll.useQuery({ page: 1, limit: 50 }, { staleTime: 10_000 });

  const loading = isLoading || isLoadingCategories;

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
                  className="flex items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-lg"
                >
                  <div className="space-y-1">
                    <div className="mb-4 flex items-center gap-2">
                      <Badge
                        variant={
                          entry.type === 'INCOME' ? 'default' : 'destructive'
                        }
                      >
                        {entry.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </Badge>
                      <Badge variant="outline">
                        {entry.status === 'PAID'
                          ? 'Pago'
                          : entry.status === 'PENDING'
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
                      {entry.referenceId && (
                        <div className="mt-4 flex items-center gap-2 text-sm">
                          <span>Ref:</span>
                          <p className="text-sm text-muted-foreground">
                            {entry.referenceId}
                          </p>
                        </div>
                      )}
                      {entry.description && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-sm">Categoria: </span>
                          <p className="text-sm text-muted-foreground">
                            {entry.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        entry.type === 'INCOME'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {entry.type === 'INCOME' ? '+ ' : '- '}
                      {maskDecimalWithAcronym(entry.amount)}
                    </p>
                    {entry.paymentMethod && (
                      <p className="text-xs uppercase text-muted-foreground">
                        {entry.paymentMethod.replace(/_/g, ' ')}
                      </p>
                    )}
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
    </div>
  );
};
