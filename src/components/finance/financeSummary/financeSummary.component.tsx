import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { IFinancialSummary } from './financeSummary.types';
import { maskBRL } from '@/utils/masksUtils';

export const FinancialSummary: React.FC<IFinancialSummary> = (
  data: IFinancialSummary,
) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Receitas */}
      <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
        <ArrowUpRight className="h-6 w-6 text-green-600" />
        <div>
          <span className="block text-sm text-muted-foreground">
            Total de Receitas
          </span>
          <span className="text-lg font-semibold text-green-600">
            {maskBRL(data.incomes, true)}
          </span>
        </div>
      </div>

      {/* Despesas */}
      <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
        <ArrowDownRight className="h-6 w-6 text-red-600" />
        <div>
          <span className="block text-sm text-muted-foreground">
            Total de Despesas
          </span>
          <span className="text-lg font-semibold text-red-600">
            {maskBRL(data.expenses, true)}
          </span>
        </div>
      </div>

      {/* Saldo */}
      <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
        <DollarSign
          className={`h-6 w-6 ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}
        />
        <div>
          <span className="block text-sm text-muted-foreground">Saldo</span>
          <span
            className={`text-lg font-semibold ${
              data.net >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {data.net >= 0 ? '' : '-'}
            {maskBRL(Math.abs(data.net), true)}
          </span>
        </div>
      </div>
    </div>
  );
};
