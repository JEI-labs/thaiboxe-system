'use client';

import { GraduationBadge } from '@/components/graduationBadge/graduationBadge.component';
import { EmptyState } from '@/components/emptyState/emptyState.component';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CreditCard, Edit2, Trash2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RowActions } from '@/components/dataTable/rowActions.component';
import ConfirmDeleteDialog from '@/components/confirmDeleteDialog/confirmDeleteDialog.component';
import { cn } from '@/lib/utils';
import { getInitials } from '@/utils/masksUtils';
import type { StudentsTableProps } from './studentCard.types';

export function StudentsTable({
  students,
  onEdit,
  onDelete,
}: StudentsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (students.length === 0) {
    return (
      <EmptyState
        title="Nenhum aluno encontrado"
        description="Ajuste a busca e os filtros, ou adicione o primeiro aluno."
      />
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Graduação</TableHead>
              <TableHead>Matriculado em</TableHead>
              <TableHead className="w-[70px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {students.map((student) => (
              <TableRow
                key={student.id}
                className="cursor-pointer"
                onClick={() => router.push(`/students/${student.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={student.avatar || undefined}
                        className="h-full w-full rounded-full object-cover"
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <Link
                        href={`/students/${student.id}`}
                        className="block truncate font-medium hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {student.name}
                      </Link>
                      <p className="text-muted-foreground truncate text-xs">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap',
                      student.status === 'EM DIA' &&
                        'bg-green-100 text-green-800',
                      student.status === 'PENDENTE' &&
                        'bg-yellow-100 text-yellow-800',
                      student.status === 'ATRASADO' &&
                        'bg-red-100 text-red-800',
                    )}
                  >
                    {student.status}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium whitespace-nowrap text-red-800">
                    {student.planName}
                  </span>
                </TableCell>

                <TableCell>
                  <GraduationBadge
                    graduation={student.graduation}
                    showLabel={false}
                  />
                </TableCell>

                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {student.createdAt
                    ? format(new Date(student.createdAt), 'dd/MM/yyyy')
                    : '—'}
                </TableCell>

                <TableCell
                  className="text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <RowActions
                    srLabel={`Ações de ${student.name}`}
                    actions={[
                      {
                        label: 'Pagamentos',
                        icon: CreditCard,
                        onSelect: () =>
                          router.push(`/students/${student.id}/payments`),
                      },
                      {
                        label: 'Editar',
                        icon: Edit2,
                        onSelect: () => onEdit(student.id),
                      },
                      {
                        label: 'Excluir',
                        icon: Trash2,
                        destructive: true,
                        onSelect: () => setDeleteId(student.id),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {deleteId && (
        <ConfirmDeleteDialog
          item={deleteId}
          open={Boolean(deleteId)}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={async (id) => {
            await onDelete(id);
            setDeleteId(null);
          }}
        />
      )}
    </>
  );
}
