import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

async function main() {
  // Criando usuário administrador
  const user = await prisma.user.upsert({
    where: { email: "admin@thaiboxe.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@thaiboxe.com",
      password: await hash("123Mudar@"),
    },
  });

  console.log(`User created/updated: ${user.email}`);

  // Criando alunos em massa
  const students = await prisma.student.createMany({
    data: Array.from({ length: 10 }, (_, index) => ({
      name: `Aluno ${index + 1}`,
      email: `aluno${index + 1}@thaiboxe.com`,
      phone: "1234567890",
      birthDate: new Date("1990-01-01"),
    })),
    skipDuplicates: true,
  });

  console.log(`Students created: ${students.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
