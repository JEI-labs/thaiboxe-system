import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

async function main() {
  // Criando usuário administrador
  const user = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@thaiboxe.com",
      password: await hash("123Mudar@"),
    },
  });

  console.log(`User created: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
