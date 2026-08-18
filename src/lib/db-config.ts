import type { PoolConfig } from "pg";

// O certificado do connection pooler do Supabase não valida contra a
// cadeia de CAs padrão do Node em vários ambientes; a conexão continua
// criptografada (TLS), só não verifica a cadeia — mesma configuração
// recomendada pela documentação do Supabase para node-postgres/Prisma.
export function pgConfig(connectionString: string | undefined): PoolConfig {
  return {
    connectionString,
    ssl: { rejectUnauthorized: false },
  };
}
