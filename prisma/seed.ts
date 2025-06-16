import { ECategoryStatus, PrismaClient } from '@prisma/client';
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

  await prisma.category.create({
    data: {
      name: 'Alunos',
      status: ECategoryStatus.ACTIVE,
      description: 'Alunos da Thaiboxe',
      userId: user.id,
    },
  });
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
