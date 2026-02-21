# Deploy do SyncLife na Vercel

Guia para finalizar o deploy. O banco e a auth já estão no **Supabase**; falta conectar o app na Vercel.

---

## 1. Lembrete: onde está cada coisa

| O quê            | Onde              |
|------------------|-------------------|
| **Banco + Auth** | **Supabase**      |
| **Frontend/API** | **Vercel** (Next.js) |

O schema do banco já foi aplicado no Supabase (você fez essa parte). Agora vamos publicar o app na Vercel.

---

## 2. Pré-requisitos

- Código no **GitHub** (repositório do projeto, ex.: `sync_life`).
- Projeto criado no **Supabase** com o `schema.sql` já executado.
- Conta na [Vercel](https://vercel.com) (pode usar login com GitHub).

---

## 3. Criar o projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (com GitHub).
2. Clique em **Add New…** → **Project**.
3. **Import** o repositório do GitHub (ex.: `sync_life`).
4. **Importante:** como o Next.js está na pasta `web/`:
   - Em **Root Directory** clique em **Edit** e defina: `web`.
   - Confirme que o **Framework Preset** está como **Next.js**.

---

## 4. Variáveis de ambiente na Vercel

Na tela do projeto (antes de dar Deploy), em **Environment Variables** adicione:

| Nome                           | Onde pegar |
|--------------------------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase → **Project Settings** → **API** → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase → **Project Settings** → **API** → **Project API keys** → **anon public** |

Marque para **Production**, **Preview** e **Development** (ou só Production se quiser).

Depois clique em **Deploy**.

---

## 5. Configurar redirect URLs no Supabase

Para login/cadastro e “esqueci senha” funcionarem no domínio da Vercel:

1. No **Supabase**: **Authentication** → **URL Configuration**.
2. Em **Site URL** coloque a URL do app na Vercel:
   - `https://sync-life-alpha.vercel.app`
3. Em **Redirect URLs** adicione:
   - `https://sync-life-alpha.vercel.app/**`

Salve. Assim o Supabase aceita redirects da sua app em produção.

---

## 6. Conferir o deploy

- Acesse a URL do app: [https://sync-life-alpha.vercel.app](https://sync-life-alpha.vercel.app).
- Teste: **Cadastro** → **Login** → **Dashboard**.
- Se algo falhar, confira:
  - Root Directory = `web`
  - Variáveis de ambiente corretas
  - Redirect URLs no Supabase: `https://sync-life-alpha.vercel.app/**`. Site URL sem barra no final: `https://sync-life-alpha.vercel.app`.

---

## 7. Resumo rápido

1. **Vercel:** Import do repo GitHub, **Root Directory** = `web`.
2. **Vercel:** Variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Supabase:** **Authentication** → **URL Configuration** → Site URL = `https://sync-life-alpha.vercel.app`, Redirect URLs = `https://sync-life-alpha.vercel.app/**`.
4. Deploy e teste de login/cadastro no domínio da Vercel.

Depois disso o deploy está finalizado; os próximos passos são os itens do [07-V1-PENDENCIAS.md](07-V1-PENDENCIAS.md) (dados reais de transações e dashboard).
