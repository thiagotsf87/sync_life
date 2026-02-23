# 19 — Setup Produção + Homologação — Passo a Passo

> Guia completo para configurar os ambientes **produção** e **homologação** em todos os sistemas.  
> Dados separados: produção e homologação não compartilham banco.

---

## Pré-requisito (já concluído)

- **GitHub**: Branch `homologacao` criada e enviada; fluxo `feature → homologacao → main` definido.

---

## Visão geral — Passos restantes

| Passo | Sistema | O que fazer |
|-------|---------|-------------|
| **1** | Supabase | Criar 2º projeto (homolog) + aplicar schema |
| **2** | Vercel | Variáveis por ambiente + domínios por branch |
| **3** | Supabase Auth | Redirect URLs para cada domínio |
| **4** | Local | `.env.local` apontando para homolog (opcional) |

---

## 1. Supabase — Dois projetos

### 1.1 Projeto PRODUÇÃO (já existe)

- URL: `https://xxxxx.supabase.co`
- Anon key: já configurada
- Mantenha como está.

### 1.2 Criar projeto HOMOLOGAÇÃO

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **New Project**
3. Preencha:
   - **Name**: `sync_life_homolog` (ou similar)
   - **Database Password**: gere e guarde
   - **Region**: mesma da produção (ex.: South America)
4. Clique em **Create new project** e aguarde a criação.

### 1.3 Configurações do projeto homolog

1. No projeto **homolog**, vá em **Project Settings** (ícone engrenagem) → **API**
2. Anote (serão usados nas variáveis `_HOMOL` no passo 2.4 e no `.env.local`):
   - **Project URL** → valor de `NEXT_PUBLIC_SUPABASE_URL_HOMOL`
   - **anon public** (Project API keys) → valor de `NEXT_PUBLIC_SUPABASE_ANON_KEY_HOMOL`

### 1.4 Aplicar schema no homolog

1. No projeto **homolog**, vá em **SQL Editor**
2. Copie todo o conteúdo de `web/supabase/schema.sql`
3. Cole no editor e execute (Run)
4. Confirme que tabelas foram criadas (Table Editor)

### 1.5 Migrações adicionais (se houver)

Se o `schema.sql` inclui políticas RLS, elas já foram aplicadas. Caso existam arquivos em `web/supabase/migrations/`, execute cada um no SQL Editor do homolog, na ordem numérica.

---

## 2. Vercel — Projeto e variáveis

### 2.1 Acessar o projeto

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Abra o projeto **sync-life** (ou o nome que você usa)

### 2.2 Configurar branch de produção

1. **Settings** → **Git**
2. Em **Production Branch**, confirme que está `main`
3. Em **Preview Branches**, deixe como está (ou adicione `homologacao` se quiser previews só dela)

### 2.3 Variáveis de ambiente — Produção

1. **Settings** → **Environment Variables**
2. Para cada variável abaixo, **se já existir**, edite e **marque só Production**:
3. **Se não existir**, crie e marque **Production**:

| Nome | Valor | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase **PRODUÇÃO** | ✅ Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key do Supabase **PRODUÇÃO** | ✅ Production |

4. Opcionalmente adicione `NEXT_PUBLIC_APP_URL` com a URL de produção (ex.: `https://sync-life-alpha.vercel.app`).

### 2.4 Variáveis de ambiente — Homologação (Preview)

1. Na mesma tela **Environment Variables** → **Add New**
2. Adicione **três** variáveis com **valores do Supabase HOMOLOG**, marque **Preview** e, se disponível, associe ao branch `homologacao`:

| Nome | Valor | Environment | Branch (opcional) |
|------|-------|-------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_ENV` | `homolog` | ✅ Preview | `homologacao` |
| `NEXT_PUBLIC_SUPABASE_URL_HOMOL` | URL do Supabase **HOMOLOG** | ✅ Preview | `homologacao` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY_HOMOL` | anon key do Supabase **HOMOLOG** | ✅ Preview | `homologacao` |

> **Importante:** Use exatamente esses nomes com sufixo `_HOMOL` — o mesmo do `.env.local` do projeto. O código usa `NEXT_PUBLIC_SUPABASE_ENV=homolog` para ler essas variáveis.

### 2.5 URLs da Vercel (domínios gratuitos)

Não é necessário comprar domínio. A Vercel já fornece URLs para cada ambiente:

| Ambiente | URL | Como obter |
|----------|-----|------------|
| **Produção** | `https://sync-life-alpha.vercel.app` | Já configurado em **Settings** → **Domains** (Production). Aponta para a branch `main`. |
| **Homologação** | `https://sync-life-alpha-git-homologacao-seuuser.vercel.app` | Surge automaticamente ao fazer deploy da branch `homologacao`. |

**Como acessar a URL de homolog:**

1. Faça push na branch `homologacao`
2. Abra o projeto na Vercel → **Deployments**
3. Clique no último deploy da branch `homologacao`
4. Clique em **Visit** — a URL exibida é a de homolog

A URL de homolog pode variar levemente (ex.: `homologacao-sync-life-alpha.vercel.app`). Use sempre a URL que aparece no deploy.

> **Futuro:** Ao comprar domínio próprio (ex.: `app.synclife.com.br`), adicione em **Domains** → **Add Existing** e associe ao ambiente correto (Production ou Preview).

---

## 3. Supabase Auth — Redirect URLs (em cada projeto)

Cada projeto Supabase precisa aceitar os URLs de redirect da app. Use as URLs da Vercel:

### 3.1 Projeto PRODUÇÃO (Supabase)

1. Abra o projeto **produção** no Supabase
2. **Authentication** → **URL Configuration**
3. Configure:
   - **Site URL**: `https://sync-life-alpha.vercel.app`
   - **Redirect URLs** — adicione:
     - `https://sync-life-alpha.vercel.app/**`
4. **Save**

### 3.2 Projeto HOMOLOG (Supabase)

1. Faça um deploy da branch `homologacao` (push) e anote a URL que a Vercel gera
2. Abra o projeto **homolog** no Supabase
3. **Authentication** → **URL Configuration**
4. Configure:
   - **Site URL**: a URL de homolog da Vercel (ex.: `https://sync-life-alpha-git-homologacao-xxx.vercel.app`)
   - **Redirect URLs** — adicione a URL exata + `/**` (ex.: `https://sync-life-alpha-git-homologacao-xxx.vercel.app/**`)
5. **Save**

> A URL de homolog pode mudar entre deploys. Se o login falhar, confira em **Deployments** qual é a URL atual e atualize no Supabase.

---

## 4. Desenvolvimento local

### 4.1 Escolher qual ambiente usar localmente

- Para testar contra **homolog**: use credenciais do projeto homolog no `.env.local`
- Para testar contra **produção** (cuidado!): use credenciais do projeto produção — só para debug pontual

### 4.2 Configurar `.env.local` (ambos os ambientes)

No arquivo `web/.env.local`, defina as variáveis de **produção** e **homolog**; use `NEXT_PUBLIC_SUPABASE_ENV` para escolher qual ambiente usar localmente:

```env
# Troque para "homolog" para usar o Supabase de homologação
NEXT_PUBLIC_SUPABASE_ENV=production

# Produção
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-prod

# Homologação
NEXT_PUBLIC_SUPABASE_URL_HOMOL=https://seu-projeto-homolog.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_HOMOL=sua-anon-key-homolog

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SyncLife
```

> Basta alterar `NEXT_PUBLIC_SUPABASE_ENV=homolog` para testar contra homologação, sem comentar ou descomentar linhas.

---

## 5. Checklist final

Marque conforme for concluindo:

### GitHub (pré-requisito)
- [x] Branch `homologacao` criada e enviada
- [x] Branch `main` é produção

### Supabase — Produção
- [ ] Projeto produção com schema aplicado
- [ ] Auth → Site URL e Redirect URLs configurados

### Supabase — Homolog
- [ ] Projeto homolog criado
- [ ] Schema `schema.sql` executado no homolog
- [ ] Auth → Site URL e Redirect URLs configurados
- [ ] URL e anon key anotadas

### Vercel
- [ ] Production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase **produção**)
- [ ] Preview: `NEXT_PUBLIC_SUPABASE_ENV=homolog`, `NEXT_PUBLIC_SUPABASE_URL_HOMOL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY_HOMOL` (Supabase **homolog**)
- [ ] Root Directory = `web`
- [ ] URLs conhecidas: Produção = `sync-life-alpha.vercel.app`, Homolog = copiada do deploy da branch `homologacao`

### Local
- [ ] `.env.local` com credenciais do homolog (ou prod, conforme preferência)

---

## 6. Como testar

### Deploy em homolog

```bash
git checkout homologacao
git merge main   # ou merge da sua feature
git push origin homologacao
```

A Vercel fará deploy automático. Para acessar:
1. Vercel → **Deployments** → clique no deploy da branch `homologacao`
2. Clique em **Visit** — essa URL usa o Supabase **homolog** (dados de teste)

### Deploy em produção

```bash
git checkout main
git merge homologacao   # após validar em homolog
git push origin main
```

A Vercel fará deploy em produção. Acesse **https://sync-life-alpha.vercel.app** → conecta no Supabase **produção** (dados reais).

---

## 7. Resumo

**URLs:** Produção = `https://sync-life-alpha.vercel.app`. Homolog = URL do deploy da branch `homologacao` (Deployments → Visit).

**Git:** `homologacao` para testar, `main` para produção.

**Vercel:** Production = `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` (prod). Preview = `NEXT_PUBLIC_SUPABASE_ENV=homolog` + `URL_HOMOL` / `ANON_KEY_HOMOL` (homolog).

**Supabase Auth:** Configure Site URL e Redirect URLs em cada projeto usando as URLs da Vercel acima.
