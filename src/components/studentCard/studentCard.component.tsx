import { getInitials } from '@/utils/masksUtils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import React from 'react';
import { StudentCardProps } from './studentCard.types';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

export const StudentCard: React.FC<StudentCardProps> = ({
  name,
  avatar,
  email,
  status,
  planName,
  onDelete,
  onEdit,
}) => {
  return (
    <Card className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16 self-center sm:self-start">
          <AvatarImage
            src={avatar}
            className="h-full w-full rounded-full object-cover"
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        {/* Separator adaptável */}
        <Separator orientation="vertical" className="hidden h-12 md:block" />
        <Separator orientation="horizontal" className="block md:hidden" />

        <div className="flex w-full flex-col justify-center text-center sm:justify-start sm:text-left">
          <h2 className="text-lg font-medium">{name}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>

        <div className="flex max-sm:justify-center max-sm:gap-4 max-sm:px-4 md:gap-4">
          <div className="flex flex-col items-center space-y-1 sm:ml-auto sm:items-start">
            <p className="w-full text-center text-sm">Matrícula</p>
            <span
              className={cn(
                'text-nowrap rounded-full px-2 py-1 text-xs font-medium',
                status === 'EM DIA' && 'bg-green-100 text-green-800',
                status === 'PENDENTE' && 'bg-yellow-100 text-yellow-800',
                status === 'ATRASADO' && 'bg-red-100 text-red-800',
              )}
            >
              {status}
            </span>
          </div>

          <div className="flex flex-col items-center space-y-1 sm:ml-auto sm:items-start">
            <p className="w-full text-center text-sm">Plano</p>
            <span
              className={cn(
                'text-nowrap rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800',
              )}
            >
              {planName}
            </span>
          </div>
        </div>
      </div>

      {/* Separator adaptável */}
      <Separator orientation="vertical" className="hidden h-12 md:block" />
      <Separator orientation="horizontal" className="block md:hidden" />

      {/* BOTÕES */}
      <div className="flex w-full justify-center gap-3 md:w-auto md:justify-end">
        <Button size="icon" onClick={onEdit} className="w-fit px-4">
          <span className="block md:hidden">Editar</span>
          <Edit2 className="h-4 w-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="w-fit px-4">
              <span className="block md:hidden">Deletar</span>
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tem certeza que deseja excluir?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. O aluno será removido
                permanentemente do sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};
