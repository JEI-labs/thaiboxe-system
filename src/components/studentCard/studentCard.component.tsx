import { getInitials } from '@/utils/masksUtils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';
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
import { DrawerDialogDemo } from '@/components/forms/drawerDialog/drawerDialog.components';
export const StudentCard: React.FC<StudentCardProps> = ({
  name,
  avatar,
  email,
  onClick,
}) => {
  return (
    <Card className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={avatar}
            className="h-full w-full rounded-full object-cover"
          />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-medium">{name}</h2>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="mr-2 flex gap-3">
        <DrawerDialogDemo />
        {/* ALERT DIALOG */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
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
              <AlertDialogAction onClick={onClick}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
};
