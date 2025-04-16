import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Por favor, insira um documento válido.'),
  password: z.string(),
});
