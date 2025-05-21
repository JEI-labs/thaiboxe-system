import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').trim(),
  phone: z.string().trim().optional(),
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
});

export type ICreateSupplier = z.infer<typeof createSupplierSchema>;

export const updateSupplierSchema = createSupplierSchema.extend({
  id: z.string().uuid(),
});

export type IUpdateSupplier = z.infer<typeof updateSupplierSchema>;
