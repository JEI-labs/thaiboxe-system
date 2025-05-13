import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { IFinancialSummary } from './financeSummary.types';

export const FinancialSummary: React.FC<IFinancialSummary> = (
  data: IFinancialSummary,
) => {
  const formatCurrency = (value: number) =>
    `R$ ${Math.abs(value).toFixed(2).replace('.', ',')}`;

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
            {formatCurrency(data.incomes)}
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
            {formatCurrency(data.expenses)}
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
            {formatCurrency(data.net)}
          </span>
        </div>
      </div>
    </div>
  );
};
