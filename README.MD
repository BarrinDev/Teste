# Gestão VIP

Sistema interno de gerenciamento de assinaturas do grupo VIP (Telegram/WhatsApp), para uso dos 4 administradores. Acessível pela internet, hospedado na Vercel, com banco Postgres na nuvem.

## Stack

- **Next.js (App Router) + TypeScript** — frontend e backend no mesmo projeto (Server Components, Server Actions e uma rota de API para o NextAuth).
- **PostgreSQL** (Neon, Supabase ou similar) acessado via **Prisma** (driver adapter `@prisma/adapter-pg`).
- **NextAuth v5 (Credentials)** — login com usuário/senha, sessão JWT em cookie `httpOnly`, sem nada guardado em memória do servidor.
- **Tailwind CSS** para a interface, responsiva.
- **Zod** para validação de formulários.
- **Recharts** para o gráfico de receita.

## Funcionalidades

- Cadastro, edição e exclusão de assinantes.
- Status (Ativo / Expira em breve / Expirado / Cancelado) calculado automaticamente a partir da data de expiração — nunca fica desatualizado.
- Busca por nome/contato, filtro por status, ordenação por data de expiração.
- Dashboard com assinantes ativos/expirados, receita total, receita do mês, quem expira nos próximos 7 dias e gráfico de receita dos últimos 6 meses.
- Histórico de pagamentos por assinante — cada renovação gera um novo registro.

---

## 1. Rodando localmente

```bash
npm install
```

Isso já roda `prisma generate` automaticamente (script `postinstall`).

Copie `.env.example` para `.env` e preencha `DATABASE_URL` (veja o passo 2) e `AUTH_SECRET`. Para gerar um `AUTH_SECRET` aleatório:

```bash
npx auth secret
```

Depois de configurar o `.env`, rode as migrations e o seed dos 4 admins (veja passos 3 e 4) e inicie o servidor:

```bash
npm run dev
```

Acesse `http://localhost:3000` e faça login com um dos usuários criados pelo seed.

---

## 2. Criando um banco Postgres gratuito (Neon ou Supabase)

### Opção A — Neon

1. Crie uma conta em [neon.com](https://neon.com) (tem plano free).
2. Crie um novo projeto (ex: `gestao-vip`).
3. No painel do projeto, vá em **Connection Details** e copie a connection string no formato:
   ```
   postgresql://usuario:senha@ep-xxxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Cole esse valor em `DATABASE_URL` no seu `.env` (localmente) e depois nas variáveis de ambiente da Vercel (passo 5).

### Opção B — Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) (tem plano free) e crie um novo projeto.
2. No dashboard do projeto, clique no botão **Connect** (topo direito) → aba **ORM** → selecione **Prisma**.
3. O Supabase mostra duas variáveis prontas (aba `.env.local`):
   - `DATABASE_URL` — pooler em modo *transaction* (porta `6543`): usada pela aplicação em produção (Vercel).
   - `DIRECT_URL` — pooler em modo *session* (porta `5432`): usada só pelo `prisma migrate`, porque o modo *transaction* não suporta os advisory locks que o Migrate precisa.
4. Copie as duas linhas. Troque `[YOUR-PASSWORD]` pela senha do banco (definida na criação do projeto, ou redefinida em **Project Settings → Database → Reset database password**).
5. Cole as duas linhas no seu `.env` (localmente) e depois nas variáveis de ambiente da Vercel (passo 5) — este projeto já está preparado para usar `DIRECT_URL` (veja `directUrl` em `prisma/schema.prisma`).

---

## 3. Configurando as variáveis de ambiente

Variáveis necessárias (veja `.env.example`):

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do Postgres (passo 2) |
| `DIRECT_URL` | Só necessária com provedores que usam pooler (Supabase); no Neon pode ser igual à `DATABASE_URL` |
| `AUTH_SECRET` | Segredo para assinar a sessão JWT (`npx auth secret`) |
| `ADMIN1_USERNAME` / `ADMIN1_PASSWORD` / `ADMIN1_NAME` | Credenciais do admin 1, usadas **só** pelo seed inicial |
| `ADMIN2_*`, `ADMIN3_*`, `ADMIN4_*` | Mesma ideia para os outros 3 admins |

**Nunca** commite o arquivo `.env` — ele já está no `.gitignore`.

---

## 4. Rodando as migrations e o seed

Com `DATABASE_URL` apontando para o banco Neon (local ou já em produção):

```bash
npx prisma migrate dev --name init
```

Isso cria a pasta `prisma/migrations` com o SQL do schema (models `Admin`, `Subscriber`, `Payment`) e aplica no banco. **Commite essa pasta** — ela é o histórico de migrations do projeto.

Depois, rode o seed para criar os 4 admins definidos no `.env`:

```bash
npm run db:seed
```

Isso cria (ou atualiza, se o usuário já existir) os 4 admins com senha em hash (bcrypt) — nunca em texto puro.

> **Erro comum com Supabase**: se aparecer `self-signed certificate in certificate chain` ou `Can't reach database server`, **não** adicione `sslmode=require` na connection string — isso faz o driver `pg` sobrepor a config de SSL do código e quebra a verificação do certificado do pooler. O projeto já resolve isso em `src/lib/db-config.ts` (conexão continua criptografada, só não valida a cadeia — mesma recomendação da documentação do Supabase). Deixe as URLs sem `sslmode` na query string.

---

## 5. Deploy na Vercel

1. Suba o projeto para um repositório no GitHub (se ainda não estiver).
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Em **Environment Variables**, adicione (para o ambiente *Production*, e também *Preview* se quiser testar PRs):
   - `DATABASE_URL`
   - `DIRECT_URL` (se estiver usando Supabase — necessária porque o `prisma migrate deploy` roda como parte do build na própria Vercel)
   - `AUTH_SECRET`
   - `ADMIN1_USERNAME` ... `ADMIN4_NAME` (só são necessárias se você for rodar o seed a partir da própria Vercel; normalmente o seed é feito da sua máquina, ver passo 4/6, então você pode deixá-las de fora do ambiente da Vercel).
4. O **Build Command** já está definido no `package.json` (`prisma generate && prisma migrate deploy && next build`), então cada deploy aplica automaticamente qualquer migration nova. Não é necessário alterar nada nas configurações da Vercel.
5. Clique em **Deploy**. Ao final, a Vercel te dá uma URL pública (`https://seu-projeto.vercel.app`) — é essa URL que os 4 admins vão acessar, de qualquer lugar, sem depender do seu computador.

Se ainda não rodou o seed (passo 4) contra o banco de produção, rode agora, apontando para a `DATABASE_URL` de produção:

```bash
DATABASE_URL="postgresql://...neon.tech/..." npm run db:seed
```

(No PowerShell: `$env:DATABASE_URL="postgresql://...neon.tech/..."; npm run db:seed`)

---

## 6. Cadastrando/alterando os 4 admins depois de já estar no ar

Use o script `scripts/manage-admin.ts`, sempre apontando `DATABASE_URL` para o banco de produção (Neon é acessível de qualquer lugar, não precisa da Vercel rodando nada especial):

```bash
# listar admins
DATABASE_URL="postgresql://...neon.tech/..." npm run admin -- list

# criar um novo admin
DATABASE_URL="postgresql://...neon.tech/..." npm run admin -- create novo_usuario "senha-forte" "Nome do Admin"

# trocar a senha de um admin existente
DATABASE_URL="postgresql://...neon.tech/..." npm run admin -- set-password admin1 "nova-senha-forte"

# remover um admin
DATABASE_URL="postgresql://...neon.tech/..." npm run admin -- delete admin1
```

No PowerShell, defina a variável antes do comando:

```powershell
$env:DATABASE_URL="postgresql://...neon.tech/..."
npm run admin -- list
```

---

## Estrutura do projeto

```
prisma/schema.prisma       # models Admin, Subscriber, Payment
prisma/seed.ts             # cria os 4 admins iniciais a partir do .env
scripts/manage-admin.ts    # criar/alterar/remover admins depois do deploy
src/lib/auth.ts            # configuração do NextAuth (Credentials + JWT)
src/lib/actions.ts         # Server Actions (CRUD de assinantes e pagamentos)
src/lib/status.ts          # cálculo do status (ativo/expirado/etc) e formatação
src/proxy.ts               # protege todas as rotas exceto /login
src/app/login               # tela de login
src/app/(app)/dashboard     # métricas e gráfico
src/app/(app)/subscribers   # listagem, cadastro, edição e detalhe (com histórico de pagamentos)
```
