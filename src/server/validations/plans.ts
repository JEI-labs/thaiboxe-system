import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z
    .string()
    .nonempty('O nome é obrigatório')
    .max(50, 'Máximo de 50 caracteres'),
  description: z.string().max(255, 'Máximo de 255 caracteres').optional(),
  price: z
    .number({ required_error: 'O preço é obrigatório' })
    .min(0.01, 'Preço deve ser maior que 0'),
  duration: z
    .number({ required_error: 'A duração é obrigatória' })
    .int('Duração deve ser um número inteiro')
    .min(1, 'Duração deve ser pelo menos 1 mês'),
});

export const updatePlanSchema = createPlanSchema.extend({
  id: z.string().uuid(),
});

export type ICreatePlan = z.infer<typeof createPlanSchema>;
export type IUpdatePlan = z.infer<typeof updatePlanSchema>;
