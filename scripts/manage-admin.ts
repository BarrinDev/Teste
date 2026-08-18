// Utility to manage admin accounts against whatever database DATABASE_URL
// points to (local .env by default, or an overridden production URL).
//
// Usage:
//   npx tsx scripts/manage-admin.ts list
//   npx tsx scripts/manage-admin.ts create <username> <password> [name]
//   npx tsx scripts/manage-admin.ts set-password <username> <newPassword>
//   npx tsx scripts/manage-admin.ts delete <username>
//
// To run against production, override DATABASE_URL for the command, e.g.:
//   DATABASE_URL="postgresql://...neon.tech/..." npx tsx scripts/manage-admin.ts list
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { pgConfig } from "../src/lib/db-config";

const adapter = new PrismaPg(pgConfig(process.env.DATABASE_URL));
const prisma = new PrismaClient({ adapter });

async function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "list": {
      const admins = await prisma.admin.findMany({ orderBy: { username: "asc" } });
      if (admins.length === 0) {
        console.log("Nenhum admin cadastrado.");
        break;
      }
      for (const admin of admins) {
        console.log(`- ${admin.username} (${admin.name})`);
      }
      break;
    }

    case "create": {
      const [username, password, name] = args;
      if (!username || !password) {
        throw new Error("Uso: create <username> <password> [name]");
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.admin.create({
        data: { username, passwordHash, name: name ?? username },
      });
      console.log(`Admin "${username}" criado.`);
      break;
    }

    case "set-password": {
      const [username, newPassword] = args;
      if (!username || !newPassword) {
        throw new Error("Uso: set-password <username> <newPassword>");
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.admin.update({ where: { username }, data: { passwordHash } });
      console.log(`Senha de "${username}" atualizada.`);
      break;
    }

    case "delete": {
      const [username] = args;
      if (!username) {
        throw new Error("Uso: delete <username>");
      }
      await prisma.admin.delete({ where: { username } });
      console.log(`Admin "${username}" removido.`);
      break;
    }

    default:
      console.log(
        "Comandos disponíveis: list | create <username> <password> [name] | set-password <username> <newPassword> | delete <username>"
      );
  }
}

main()
  .catch((error) => {
    console.error(error.message ?? error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
