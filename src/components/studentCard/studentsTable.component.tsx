'use client';

import { useState } from 'react';
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
import { StudentPaymentDialog } from './studentPaymentDialog.component';
import type { StudentsTableProps } from './studentCard.types';

const STATUS_STYLES: Record<string, string> = {
  'EM DIA': 'bg-green-100 text-green-800',
  'PENDENTE': 'bg-yellow-100 text-yellow-800',
  'ATRASADO': 'bg-red-100 text-red-800',
};

export function StudentsTable({
  students,
  onEdit,
  onDelete,
}: StudentsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [payingStudent, setPayingStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Matriculado em</TableHead>
              <TableHead className="w-[70px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
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
                      <p className="truncate font-medium">{student.name}</p>
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
                      STATUS_STYLES[student.status],
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

                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {student.createdAt
                    ? format(new Date(student.createdAt), 'dd/MM/yyyy')
                    : '—'}
                </TableCell>

                <TableCell className="text-right">
                  <RowActions
                    srLabel={`Ações de ${student.name}`}
                    actions={[
                      {
                        label: 'Registrar pagamento',
                        icon: CreditCard,
                        onSelect: () =>
                          setPayingStudent({
                            id: student.id,
                            name: student.name,
                          }),
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

      {payingStudent && (
        <StudentPaymentDialog
          studentId={payingStudent.id}
          studentName={payingStudent.name}
          open={Boolean(payingStudent)}
          onOpenChange={(open) => !open && setPayingStudent(null)}
        />
      )}

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
