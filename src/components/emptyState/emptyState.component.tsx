import { Inbox } from 'lucide-react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  /** Linha de apoio: o que fazer a seguir. */
  description?: string;
  icon?: React.ElementType;
  className?: string;
}

/**
 * Estado vazio das listagens. Uma caixa tracejada ocupa o lugar da tabela,
 * em vez de uma frase solta no meio do branco.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center',
        className,
      )}
    >
      <span className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="h-6 w-6" aria-hidden />
      </span>

      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-sm text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
