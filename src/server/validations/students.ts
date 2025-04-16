import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Por favor, insira um nome válido.'),
  email: z.string().email('Por favor, insira um endereço de email válido.'),
  phone: z.string().min(10, 'Por favor, insira um telefone válido'),
  avatarUrl: z.string().nullable(),
  birthDate: z.string().min(1, 'Por favor, insira uma data válida'),
});

export const updateAvatarSchema = z.object({
  avatarUrl: z.string().min(1, 'Por favor, insira uma imagem válida'),
  studentId: z.string().min(1, 'Por favor, insira um ID válido'),
});

export type IStudentCreateTypes = z.infer<typeof createStudentSchema>;

export const defaultCreateStudentValues = {
  name: '',
  email: '',
  phone: '',
  avatarUrl: '',
  birthDate: undefined,
};
