# 19 — Setup Produção + Homologação — Passo a Passo

> Guia completo para configurar os ambientes **produção** e **homologação** em todos os sistemas.  
> Dados separados: produção e homologação não compartilham banco.

---

## Visão geral

| Sistema | O que fazer |
|---------|-------------|
| **1. GitHub** | Criar branch `homologacao` |
| **2. Supabase** | Criar 2º projeto (homolog) + aplicar schema |
| **3. Vercel** | Variáveis por ambiente + domínios por branch |
| **4. Supabase Auth** | Redirect URLs para cada domínio |
| **5. Local** | `.env.local` apontando para homolog (opcional) |

---

## 1. GitHub — Branches

### 1.1 Criar branch de homologação

```bash
cd c:\Projetos\sync_life
git checkout main
git pull origin main
git checkout -b homologacao
git push -u origin homologacao
```

### 1.2 Proteger branches (opcional)

No GitHub: **Settings** → **Branches** → **Add branch protection rule**:

- **main**: exigir PR e aprovação antes de merge.
- **homologacao**: pode exigir PR; normalmente menos restrito.

### 1.3 Fluxo de trabalho

```
feature/xxx  →  homologacao  →  main
                  (testar)      (produção)
```

---

## 2. Supabase — Dois projetos

### 2.1 Projeto PRODUÇÃO (já existe)

- URL: `https://xxxxx.supabase.co`
- Anon key: já configurada
- Mantenha como está.

### 2.2 Criar projeto HOMOLOGAÇÃO

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **New Project**
3. Preencha:
   - **Name**: `sync_life_homolog` (ou similar)
   - **Database Password**: gere e guarde
   - **Region**: mesma da produção (ex.: South America)
4. Clique em **Create new project** e aguarde a criação.

### 2.3 Configurações do projeto homolog

1. No projeto **homolog**, vá em **Project Settings** (ícone engrenagem) → **API**
2. Anote:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL` (homolog)
   - **anon public** (Project API keys) → será `NEXT_PUBLIC_SUPABASE_ANON_KEY` (homolog)

### 2.4 Aplicar schema no homolog

1. No projeto **homolog**, vá em **SQL Editor**
2. Copie todo o conteúdo de `web/supabase/schema.sql`
3. Cole no editor e execute (Run)
4. Confirme que tabelas foram criadas (Table Editor)

### 2.5 Políticas RLS (se houver)

Se o `schema.sql` inclui políticas RLS, elas já foram aplicadas. Caso você tenha migrações manuais, execute-as também no projeto homolog.

---

## 3. Vercel — Projeto e variáveis

### 3.1 Acessar o projeto

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Abra o projeto **sync-life** (ou o nome que você usa)

### 3.2 Configurar branch de produção

1. **Settings** → **Git**
2. Em **Production Branch**, confirme que está `main`
3. Em **Preview Branches**, deixe como está (ou adicione `homologacao` se quiser previews só dela)

### 3.3 Variáveis de ambiente — Produção

1. **Settings** → **Environment Variables**
2. Para cada variável abaixo, **se já existir**, edite e **marque só Production**:
3. **Se não existir**, crie e marque **Production**:

| Nome | Valor | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase **PRODUÇÃO** | ✅ Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key do Supabase **PRODUÇÃO** | ✅ Production |

4. Opcionalmente adicione `NEXT_PUBLIC_APP_URL` com a URL de produção (ex.: `https://app.synclife.com.br`).

### 3.4 Variáveis de ambiente — Homologação (Preview)

1. Na mesma tela **Environment Variables**
2. Adicione (ou edite) as mesmas variáveis, mas com **valores do Supabase HOMOLOG** e marque **Preview**:

| Nome | Valor | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase **HOMOLOG** | ✅ Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key do Supabase **HOMOLOG** | ✅ Preview |

> **Importante:** Na Vercel, deploys de branches que não são `main` usam variáveis de **Preview** por padrão. O deploy da branch `homologacao` usará essas variáveis.

### 3.5 Domínios (opcional, mas recomendado)

1. **Settings** → **Domains**
2. Domínio de produção (ex.: `app.synclife.com.br`):
   - Adicione o domínio
   - Associe ao branch `main`
3. Domínio de homologação (ex.: `homolog.synclife.com.br`):
   - Adicione o domínio
   - Associe ao branch `homologacao`
4. Se não tiver domínio próprio, use os padrões da Vercel:
   - Produção: `sync-life-xxx.vercel.app` (main)
   - Homolog: `sync-life-xxx-git-homologacao-xxx.vercel.app` (preview)

---

## 4. Supabase Auth — Redirect URLs (em cada projeto)

Cada projeto Supabase precisa aceitar os URLs de redirect da app no seu ambiente.

### 4.1 Projeto PRODUÇÃO (Supabase)

1. Abra o projeto **produção** no Supabase
2. **Authentication** → **URL Configuration**
3. Configure:
   - **Site URL**: `https://app.synclife.com.br` (ou a URL real de produção)
   - **Redirect URLs**: adicione:
     - `https://app.synclife.com.br/**`
     - `https://sync-life-xxx.vercel.app/**` (URL Vercel de prod, se usar)
4. **Save**

### 4.2 Projeto HOMOLOG (Supabase)

1. Abra o projeto **homolog** no Supabase
2. **Authentication** → **URL Configuration**
3. Configure:
   - **Site URL**: `https://homolog.synclife.com.br` (ou a URL real de homolog)
   - **Redirect URLs**: adicione:
     - `https://homolog.synclife.com.br/**`
     - `https://sync-life-xxx-git-homologacao-xxx.vercel.app/**` (URL preview da Vercel)
4. **Save**

> Se ainda não tiver domínios, use as URLs `.vercel.app` que a Vercel mostra em cada deploy.

---

## 5. Desenvolvimento local

### 5.1 Escolher qual ambiente usar localmente

- Para testar contra **homolog**: use credenciais do projeto homolog no `.env.local`
- Para testar contra **produção** (cuidado!): use credenciais do projeto produção — só para debug pontual

### 5.2 Configurar `.env.local` (homolog)

No arquivo `web/.env.local`:

```env
# Homologação — Supabase homolog
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto-homolog.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-homolog

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SyncLife

# E2E (opcional)
PLAYWRIGHT_TEST_EMAIL=teste@exemplo.com
PLAYWRIGHT_TEST_PASSWORD=senha123
```

> O `.env.local` não é versionado (está no `.gitignore`). Cada dev pode apontar para homolog ou prod conforme necessidade.

---

## 6. Checklist final

Marque conforme for concluindo:

### GitHub
- [ ] Branch `homologacao` criada e enviada
- [ ] Branch `main` é produção

### Supabase — Produção
- [ ] Projeto produção com schema aplicado
- [ ] Auth → Site URL e Redirect URLs configurados

### Supabase — Homolog
- [ ] Projeto homolog criado
- [ ] Schema `schema.sql` executado no homolog
- [ ] Auth → Site URL e Redirect URLs configurados
- [ ] URL e anon key anotadas

### Vercel
- [ ] Variáveis Production → Supabase **produção**
- [ ] Variáveis Preview → Supabase **homolog**
- [ ] Root Directory = `web`
- [ ] Domínios opcionais configurados

### Local
- [ ] `.env.local` com credenciais do homolog (ou prod, conforme preferência)

---

## 7. Como testar

### Deploy em homolog

```bash
git checkout homologacao
git merge main   # ou merge da sua feature
git push origin homologacao
```

A Vercel fará deploy automático. Acesse a URL de preview → deve conectar no Supabase **homolog** (dados vazios ou de teste).

### Deploy em produção

```bash
git checkout main
git merge homologacao   # após validar em homolog
git push origin main
```

A Vercel fará deploy em produção → conecta no Supabase **produção** (dados reais).

---

## 8. Resumo em uma frase

**Git**: `homologacao` para testar, `main` para produção. **Vercel**: Production vars = Supabase prod, Preview vars = Supabase homolog. **Supabase**: dois projetos, cada um com seu Auth configurado para o domínio correto.
