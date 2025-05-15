import { prisma } from '@/server/db';

export async function getStudentPaymentStatus(studentId: string) {
  const now = new Date();

  const overdue = await prisma.payment.findFirst({
    where: {
      studentId,
      status: 'PENDING',
      dueDate: { lt: now },
    },
  });

  if (overdue) return 'INADIMPLENTE';

  const pending = await prisma.payment.findFirst({
    where: {
      studentId,
      status: 'PENDING',
      dueDate: { gte: now },
    },
  });

  if (pending) return 'PENDENTE';

  return 'EM DIA';
}
