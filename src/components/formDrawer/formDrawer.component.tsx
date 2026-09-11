'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

interface FormDrawerProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  side?: DrawerSide;
  title: string;
  description?: string;
  /** Já envolvido em form.handleSubmit pelo chamador. */
  onSubmit: (_event: React.FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  /** Rótulo enquanto envia, ex.: "Salvando...". */
  submitPendingLabel?: string;
  isSubmitting?: boolean;
  cancelLabel?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Casca única dos drawers de formulário: mesma largura em todos, cabeçalho e
 * rodapé fixos e só os campos rolando — antes cada um definia a própria
 * largura (30vw, 40vw, …) e deixava o botão de enviar flutuando no fim do
 * conteúdo, fora de alcance em formulários longos.
 */
export function FormDrawer({
  open,
  onOpenChange,
  side = 'right',
  title,
  description,
  onSubmit,
  submitLabel,
  submitPendingLabel,
  isSubmitting = false,
  cancelLabel = 'Cancelar',
  children,
  className,
}: FormDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn('flex w-full flex-col gap-0 p-0 sm:max-w-lg', className)}
      >
        {/* h-full + min-h-0 mantêm cabeçalho e rodapé visíveis com o miolo
            rolando por dentro */}
        <form onSubmit={onSubmit} className="flex h-full min-h-0 flex-col">
          <SheetHeader className="space-y-1 border-b px-6 py-5 text-left">
            <SheetTitle className="text-xl">{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
            {children}
          </div>

          <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                {cancelLabel}
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && submitPendingLabel
                ? submitPendingLabel
                : submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
