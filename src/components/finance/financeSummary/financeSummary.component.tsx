import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import { IFinancialSummary } from './financeSummary.types';
import { maskBRL } from '@/utils/masksUtils';

export const FinancialSummary: React.FC<IFinancialSummary> = (
  data: IFinancialSummary,
) => {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {/* Receitas */}
      <div className="bg-muted flex items-center gap-4 rounded-lg p-4">
        <ArrowUpRight className="h-6 w-6 text-green-600" />
        <div>
          <span className="text-muted-foreground block text-sm">
            Total de Receitas Pagas
          </span>
          <span className="text-lg font-semibold text-green-600">
            {maskBRL(data.incomes, true)}
          </span>
        </div>
      </div>

      {/* Despesas */}
      <div className="bg-muted flex items-center gap-4 rounded-lg p-4">
        <ArrowDownRight className="h-6 w-6 text-red-600" />
        <div>
          <span className="text-muted-foreground block text-sm">
            Total de Despesas Pagas
          </span>
          <span className="text-lg font-semibold text-red-600">
            {maskBRL(data.expenses, true)}
          </span>
        </div>
      </div>

      {/* Receitas de Alunos */}
      <div className="bg-muted flex items-center gap-4 rounded-lg p-4">
        <GraduationCap className="h-6 w-6 text-blue-600" />
        <div>
          <span className="text-muted-foreground block text-sm">
            Receitas Pagas de Alunos
          </span>
          <span className="text-lg font-semibold text-blue-600">
            {maskBRL(data.studentIncomes || 0, true)}
          </span>
        </div>
      </div>

      {/* Saldo */}
      <div className="bg-muted flex items-center gap-4 rounded-lg p-4">
        <DollarSign
          className={`h-6 w-6 ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}
        />
        <div>
          <span className="text-muted-foreground block text-sm">Saldo</span>
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
