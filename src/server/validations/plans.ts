// src/server/validations/plans.ts
import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.string().min(1, 'Preço deve ser maior que zero'),
  duration: z.number().int().positive('Duração deve ser maior que zero'),
});

export type ICreatePlanSchema = z.infer<typeof createPlanSchema>;
