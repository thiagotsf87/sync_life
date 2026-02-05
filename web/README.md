# SyncLife - Controle Financeiro Inteligente

Sua vida em sincronia. Organize, evolua, conquiste.

## 🚀 Stack Tecnológica

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL)
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Conta no [Supabase](https://supabase.com)

## 🛠️ Configuração

### 1. Instalar dependências

```bash
cd web
npm install
```

### 2. Configurar Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Vá em **Project Settings > API** e copie:
   - Project URL
   - anon public key

3. Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env.local
```

4. Edite `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Configurar o banco de dados

1. No Supabase, vá em **SQL Editor**
2. Execute o conteúdo do arquivo `supabase/schema.sql`

### 4. Configurar autenticação

1. No Supabase, vá em **Authentication > Providers**
2. Habilite **Email** (já vem habilitado por padrão)
3. (Opcional) Configure **Google OAuth**:
   - Crie credenciais no [Google Cloud Console](https://console.cloud.google.com)
   - Adicione as credenciais no Supabase

## 🏃 Executar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy na Vercel

1. Faça push do código para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 📁 Estrutura do Projeto

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Rotas de autenticação
│   │   ├── login/
│   │   ├── cadastro/
│   │   └── esqueceu-senha/
│   ├── (app)/                # Rotas protegidas
│   │   ├── dashboard/
│   │   ├── transacoes/
│   │   └── configuracoes/
│   └── auth/callback/        # OAuth callback
├── components/
│   ├── ui/                   # shadcn/ui
│   ├── layout/               # Sidebar, Header
│   ├── dashboard/            # Componentes do dashboard
│   └── transactions/         # Componentes de transações
├── lib/
│   ├── supabase/             # Cliente Supabase
│   ├── utils.ts
│   └── format.ts             # Formatação
├── types/                    # TypeScript types
├── constants/                # Categorias, etc.
└── hooks/                    # React hooks
```

## ✨ Funcionalidades (MVP v1)

- [x] Autenticação (Email/Senha + Google)
- [x] Dashboard com resumo financeiro
- [x] Gráficos de receitas vs despesas
- [x] Gerenciamento de transações (CRUD)
- [x] Filtros por tipo, categoria e data
- [x] Categorias pré-definidas
- [x] Layout responsivo (mobile/desktop)
- [x] Tema dark mode

## 📄 Licença

Projeto privado - © 2026 SyncLife
