# Mentoria

Plataforma web para gerenciar planos alimentares e de treino de alunos e
pacientes em um só lugar. Um profissional (personal/nutricionista) cadastra
seus alunos e monta planos; cada aluno tem seu próprio login para acompanhar
o plano ativo.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Prisma](https://www.prisma.io) + SQLite (fácil trocar para Postgres em produção)
- [Auth.js (NextAuth v5)](https://authjs.dev) com login por e-mail/senha

## Como rodar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e ajuste os valores (principalmente
   `AUTH_SECRET`, gerado com `openssl rand -base64 32`, e os dados da conta
   do profissional):

   ```bash
   cp .env.example .env
   ```

3. Rode as migrations do banco:

   ```bash
   npx prisma migrate dev
   ```

4. Crie a conta do profissional (dono da plataforma) a partir das variáveis
   `PROFESSIONAL_*` do `.env`:

   ```bash
   npm run db:seed
   ```

5. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

Acesse [http://localhost:3000](http://localhost:3000), entre com o e-mail/senha
definidos em `PROFESSIONAL_EMAIL`/`PROFESSIONAL_PASSWORD` e cadastre seus
alunos pelo painel (`/dashboard`). Cada aluno cadastrado recebe um login
próprio para acessar `/portal` e ver seu plano alimentar e de treino ativos.

## Estrutura

- `/dashboard` — área do profissional: cadastro de alunos e construção dos
  planos alimentares (refeições e itens com macros) e de treino (dias e
  exercícios).
- `/portal` — área do aluno: visualização somente leitura dos planos ativos.
- `prisma/schema.prisma` — modelo de dados (usuários, alunos, planos).

## Próximos passos sugeridos

- Trocar o banco para Postgres em produção (basta ajustar `DATABASE_URL` e o
  `provider` do datasource no `schema.prisma`).
- Exportar planos em PDF.
- Versão mobile (app) reaproveitando o mesmo banco/API.
