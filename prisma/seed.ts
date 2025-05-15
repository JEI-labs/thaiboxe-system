import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // 1. Criar ou atualizar o usuário administrador
  const user = await prisma.user.upsert({
    where: { email: 'admin@thaiboxe.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@thaiboxe.com',
      password: await hash('123Mudar@'),
    },
  });

  console.log(`Usuário criado/atualizado: ${user.email}`);

  // 2. Criar alunos com vínculo ao userId
  const students = await prisma.student.createMany({
    data: Array.from({ length: 10 }, (_, index) => ({
      name: `Aluno ${index + 1}`,
      email: `aluno${index + 1}@thaiboxe.com`,
      phone: '1234567890',
      birthDate: new Date('1990-01-01'),
      userId: user.id, // <- vínculo com o user criado acima
    })),
    skipDuplicates: true,
  });

  console.log(`Alunos criados: ${students.count}`);
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
