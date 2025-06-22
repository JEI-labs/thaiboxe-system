'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { maskDecimalWithAcronym } from '@/utils/masksUtils';
import { api } from '@/trpc/react';
import { useToast } from '@/hooks/use-toast';

type Installment = {
  date: string;
  amount: number;
  rawDate: Date;
};

interface StudentInstallmentsDropdownProps {
  studentId: string;
  paidInstallments: Array<Installment>;
  pendingInstallments: Array<Installment>;
}

export const StudentInstallmentsDropdown: React.FC<
  StudentInstallmentsDropdownProps
> = ({ paidInstallments, pendingInstallments, studentId }) => {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedInstallment, setSelectedInstallment] =
    useState<Installment | null>(null);

  const renderLabel = () => selectedLabel || 'Ver Parcelas';

  const { mutate: updatePayment, isPending } =
    api.payment.updatePayment.useMutation({
      onSuccess: () => {
        toast({
          title: 'Pagamento registrado!',
          description: 'A parcela foi lançada nos lançamentos financeiros.',
        });
        utils.payment.getPaymentsByStudent.invalidate({ studentId });
      },
      onError: () => {
        toast({
          title: 'Erro ao registrar pagamento',
          variant: 'destructive',
        });
      },
    });

  const handlePay = () => {
    if (!selectedInstallment) return;

    updatePayment({
      studentId,
      dueDate: selectedInstallment.rawDate.toISOString(),
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 text-sm">
            {renderLabel()} <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>Pagas</DropdownMenuLabel>
          {paidInstallments.length > 0 ? (
            paidInstallments.map((item, idx) => (
              <DropdownMenuItem
                key={`paid-${idx}`}
                onClick={() => {
                  setSelectedLabel(
                    `Paga: ${item.date} - ${maskDecimalWithAcronym(item.amount)}`,
                  );
                  setSelectedInstallment(null);
                }}
              >
                {item.date} - {maskDecimalWithAcronym(item.amount)}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem className="italic text-muted-foreground">
              Nenhuma parcela paga
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Pendentes</DropdownMenuLabel>
          {pendingInstallments.length > 0 ? (
            pendingInstallments.map((item, idx) => (
              <DropdownMenuItem
                key={`pending-${idx}`}
                onClick={() => {
                  setSelectedLabel(
                    `Pendente: ${item.date} - ${maskDecimalWithAcronym(item.amount)}`,
                  );
                  setSelectedInstallment(item);
                }}
              >
                {item.date} - {maskDecimalWithAcronym(item.amount)}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem className="italic text-muted-foreground">
              Nenhuma pendente
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="default"
        className="flex items-center gap-2 text-sm"
        onClick={handlePay}
        disabled={!selectedInstallment}
      >
        <CreditCard className="h-4 w-4" />
        {isPending ? 'Pagando parcela...' : 'Registrar pagamento'}
      </Button>
    </div>
  );
};
