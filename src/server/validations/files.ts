// server/validations/files.ts
import { z } from 'zod';

export const uploadFileSchema = z.object({
  filename: z.string().min(1, 'Nome do arquivo é obrigatório'),
  file: z.string().base64(),
});
