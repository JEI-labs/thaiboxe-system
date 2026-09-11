'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppPagination } from '@/components/appPagination/appPagination.component';
import { LoadingContent } from '@/components/LoadingContent';
import { useResetOnChange } from '@/hooks/useResetOnChange/useResetOnChange.hook';
import { api } from '@/trpc/react';

const STATUS_TABS = [
  { id: 'ALL', label: 'Todas' },
  { id: 'PAID', label: 'Pagas' },
  { id: 'PENDING', label: 'Pendentes' },
] as const;

type StatusFilter = (typeof STATUS_TABS)[number]['id'];

const formatDate = (value: Date | string | null | undefined) =>
  value ? format(new Date(value), 'dd/MM/yyyy') : '—';

const formatMoney = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function StudentPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // trocar de filtro com a página 2 aberta deixaria a lista vazia
  useResetOnChange([status, limit], () => setPage(1));

  const { data, isLoading } =
    api.payment.getPaymentsByStudentPaginated.useQuery({
      studentId: id,
      page,
      limit,
      status,
    });

  const studentName = data?.student.name ?? '';

  return (
    <div className="w-full">
      <BreadcrumbUpdater
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Alunos', href: '/students' },
          ...(studentName
            ? [{ label: studentName, href: `/students/${id}` }]
            : []),
          { label: 'Parcelas', href: `/students/${id}/payments` },
        ]}
      />

      <Button
        variant="ghost"
        className="mb-4 -ml-2"
        onClick={() => router.push(`/students/${id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para o aluno
      </Button>

      <h1 className="text-2xl font-semibold">
        Parcelas{studentName ? ` de ${studentName}` : ''}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.id}
            size="sm"
            variant={status === tab.id ? 'default' : 'outline'}
            onClick={() => setStatus(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-6">
          <LoadingContent textLoading="Carregando parcelas..." />
        </div>
      ) : (
        <>
          <Card className="mt-4">
            <CardContent className="p-0">
              {data && data.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pago em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((payment) => {
                      const isOverdue =
                        payment.status === 'PENDING' &&
                        new Date(payment.dueDate) < new Date();

                      return (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.dueDate)}</TableCell>
                          <TableCell className="text-right">
                            {formatMoney(Number(payment.amount))}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === 'PAID'
                                  ? 'success'
                                  : isOverdue
                                    ? 'destructive'
                                    : 'alert'
                              }
                            >
                              {payment.status === 'PAID'
                                ? 'Paga'
                                : isOverdue
                                  ? 'Atrasada'
                                  : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {payment.status === 'PAID'
                              ? formatDate(payment.paymentDate)
                              : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  Nenhuma parcela encontrada para este filtro.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 w-full">
            <AppPagination
              totalItems={data?.pagination.total ?? 0}
              itemsPerPage={limit}
              currentPage={page}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
            />
          </div>
        </>
      )}
    </div>
  );
}
