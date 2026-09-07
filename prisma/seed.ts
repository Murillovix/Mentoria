import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.PROFESSIONAL_NAME ?? "Treinador";
  const email = process.env.PROFESSIONAL_EMAIL;
  const password = process.env.PROFESSIONAL_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Defina PROFESSIONAL_EMAIL e PROFESSIONAL_PASSWORD no .env antes de rodar o seed."
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const professional = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "PROFESSIONAL" },
    create: { name, email, passwordHash, role: "PROFESSIONAL" },
  });

  console.log(`Usuário profissional pronto: ${professional.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
