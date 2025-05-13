'use client';

import React from 'react';
import { CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ICategoryList } from './categoryList.types';

export const CategoriesList: React.FC<ICategoryList> = ({
  categories,
  isLoading,
}) => {
  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle>Lista de Categorias</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="py-4 text-center">Carregando categorias…</p>
        ) : categories.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">
            Não foram encontradas categorias.
          </p>
        ) : (
          <ScrollArea className="h-full w-full">
            <div className="space-y-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-col rounded-lg border p-4 transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{cat.name}</h3>
                    <Badge
                      variant={
                        cat.status === 'ACTIVE' ? 'default' : 'destructive'
                      }
                    >
                      {cat.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>

                  {cat.description && (
                    <div className="mt-4">
                      <span className="mr-2 text-sm font-semibold">
                        Descrição:
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {cat.description}
                      </span>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground">
                    Criada em:{' '}
                    {new Date(cat.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </div>
  );
};

export default CategoriesList;
