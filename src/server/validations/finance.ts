// server/validations/finance.ts
import { z } from 'zod';

export const createFinanceEntrySchema = z.object({
  date: z
    .string()
    .nonempty('A data é obrigatória')
    .regex(
      /^([0-2]\d|3[0-1])\/(0\d|1[0-2])\/\d{4}$/,
      'Formato da data deve ser DD/MM/AAAA',
    ),
  amount: z.preprocess(
    (val) => {
      if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
      return val;
    },
    z
      .number({ invalid_type_error: 'O valor deve ser numérico' })
      .positive('O valor deve ser maior que zero'),
  ),
  category: z
    .string()
    .nonempty('A categoria é obrigatória')
    .max(50, 'A categoria pode ter no máximo 50 caracteres'),
  description: z
    .string()
    .max(200, 'A descrição pode ter no máximo 200 caracteres')
    .optional(),
});

export type ICreateFinanceEntry = z.infer<typeof createFinanceEntrySchema>;

// opcional: valores padrão para inicializar o formulário
export const defaultCreateFinanceEntryValues: ICreateFinanceEntry = {
  date: '',
  amount: 0,
  category: '',
  description: '',
};
