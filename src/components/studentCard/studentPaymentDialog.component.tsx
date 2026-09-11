'use client';

import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';
import { useToast } from '@/hooks/use-toast';
import { maskDecimalWithAcronym } from '@/utils/masksUtils';

interface StudentPaymentDialogProps {
  studentId: string;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentPaymentDialog({
  studentId,
  studentName,
  open,
  onOpenChange,
}: StudentPaymentDialogProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  // só busca quando o diálogo abre: antes a lista disparava uma query
  // dessas por aluno renderizado
  const { data, isLoading } = api.payment.getPaymentsByStudent.useQuery(
    { studentId },
    { enabled: open },
  );

  const { mutate: updatePayment, isPending } =
    api.payment.updatePayment.useMutation({
      onSuccess: () => {
        toast({
          title: 'Pagamento registrado!',
          description: 'A parcela foi lançada nos lançamentos financeiros.',
        });
        utils.payment.getPaymentsByStudent.invalidate({ studentId });
        onOpenChange(false);
      },
      onError: () => {
        toast({ title: 'Erro ao registrar pagamento', variant: 'destructive' });
      },
    });

  const paid = data?.paid ?? [];
  const pending = data?.pending ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Parcelas de {studentName}</DialogTitle>
          <DialogDescription>
            Selecione uma parcela pendente para registrar o pagamento.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            Carregando parcelas…
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">Pendentes</h3>
              {pending.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">
                  Nenhuma parcela pendente.
                </p>
              ) : (
                <ul className="space-y-2">
                  {pending.map((item) => (
                    <li
                      key={item.dueDate.toString()}
                      className="flex items-center justify-between gap-3 rounded-md border p-2"
                    >
                      <span className="text-sm">
                        {format(new Date(item.dueDate), 'dd/MM/yyyy')} —{' '}
                        {maskDecimalWithAcronym(Number(item.amount) * 100)}
                      </span>
                      <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() =>
                          updatePayment({
                            studentId,
                            dueDate: new Date(item.dueDate).toISOString(),
                          })
                        }
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        {isPending ? 'Registrando…' : 'Registrar'}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 text-sm font-medium">Pagas</h3>
              {paid.length === 0 ? (
                <p className="text-muted-foreground text-sm italic">
                  Nenhuma parcela paga.
                </p>
              ) : (
                <ul className="space-y-2">
                  {paid.map((item) => (
                    <li
                      key={item.dueDate.toString()}
                      className="flex items-center justify-between gap-3 rounded-md border p-2"
                    >
                      <span className="text-muted-foreground text-sm">
                        {format(new Date(item.dueDate), 'dd/MM/yyyy')} —{' '}
                        {maskDecimalWithAcronym(Number(item.amount) * 100)}
                      </span>
                      <Badge variant="success">Paga</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
