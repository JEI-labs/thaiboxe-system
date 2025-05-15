import { z } from 'zod';

export interface ISheetEditPlan {
  isOpen: boolean;
  setIsOpen: (_open: boolean) => void;
  planId: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  refetch?: () => void;
}

export const updatePlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.string().min(0, 'Preço deve ser positivo'),
  duration: z.number().min(1, 'Duração deve ser no mínimo 1 mês'),
});

export type IUpdatePlan = z.infer<typeof updatePlanSchema>;
