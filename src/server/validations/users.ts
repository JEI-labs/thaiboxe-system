import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(1, "Por favor, insira um nome válido."),
  email: z.string().email("Por favor, insira um endereço de email válido."),
  phone: z.string().min(10, "Por favor, insira um telefone válido"),
  birthDate: z.date().optional(),
});

// id          String       @id @default(uuid())
// name        String
// email       String       @unique
// phone       String?
// birthDate   DateTime?
// createdAt   DateTime     @default(now())
// updatedAt   DateTime     @updatedAt
// enrollments Enrollment[]
// payments    Payment[]
// attendances Attendance[]
