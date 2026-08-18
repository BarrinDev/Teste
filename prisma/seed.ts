import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { pgConfig } from "../src/lib/db-config";

const adapter = new PrismaPg(pgConfig(process.env.DATABASE_URL));
const prisma = new PrismaClient({ adapter });

type AdminSeed = { username: string; password: string; name: string };

function loadAdminsFromEnv(): AdminSeed[] {
  const admins: AdminSeed[] = [];
  const missing: string[] = [];

  for (let i = 1; i <= 4; i++) {
    const username = process.env[`ADMIN${i}_USERNAME`];
    const password = process.env[`ADMIN${i}_PASSWORD`];
    const name = process.env[`ADMIN${i}_NAME`] ?? username;

    if (!username || !password) {
      missing.push(`ADMIN${i}_USERNAME / ADMIN${i}_PASSWORD`);
      continue;
    }
    admins.push({ username, password, name: name! });
  }

  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente ausentes para o seed dos admins: ${missing.join(", ")}. ` +
        "Defina ADMIN1_USERNAME..ADMIN4_PASSWORD no seu .env antes de rodar o seed."
    );
  }

  return admins;
}

async function main() {
  const admins = loadAdminsFromEnv();

  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(admin.password, 10);
    await prisma.admin.upsert({
      where: { username: admin.username },
      update: { passwordHash, name: admin.name },
      create: { username: admin.username, passwordHash, name: admin.name },
    });
    console.log(`Admin "${admin.username}" cadastrado/atualizado.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
