/**
 * Provisiona (ou atualiza) usuário admin em todos os projetos Supabase configurados.
 *
 * Uso:
 *   node scripts/create-admin-user.mjs
 *   node scripts/create-admin-user.mjs --email admin@synclife.dev --password "SyncLife@Admin2026!"
 *
 * Variáveis em web/.env.local:
 *   ADMIN_EMAIL / ADMIN_PASSWORD (opcional)
 *   SUPABASE_SERVICE_ROLE_KEY          → homolog (fallback)
 *   SUPABASE_SERVICE_ROLE_KEY_HOMOL    → homolog (opcional)
 *   SUPABASE_SERVICE_ROLE_KEY_PROD     → produção (opcional; tenta API se ausente)
 *   SUPABASE_ACCESS_TOKEN              → busca service role de prod via Management API
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const DEFAULT_EMAIL = 'admin@synclife.dev'
const DEFAULT_PASSWORD = 'SyncLife@Admin2026!'

function loadEnvFile(path) {
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

function parseArgs(argv) {
  const args = { email: null, password: null }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--email' && argv[i + 1]) args.email = argv[++i]
    if (argv[i] === '--password' && argv[i + 1]) args.password = argv[++i]
  }
  return args
}

async function fetchServiceRoleKey(projectRef, accessToken) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/api-keys`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Management API (${projectRef}): ${res.status} ${body}`)
  }
  const keys = await res.json()
  const service = keys.find((k) => k.name === 'service_role')
  if (!service?.api_key) throw new Error(`service_role não encontrada em ${projectRef}`)
  return service.api_key
}

function projectRefFromUrl(url) {
  try {
    return new URL(url).hostname.split('.')[0]
  } catch {
    return null
  }
}

async function listUsersByEmail(admin, email) {
  const normalized = email.toLowerCase()
  let page = 1
  while (page <= 20) {
    let data
    let error
    try {
      ;({ data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 }))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'listUsers network error')
    }
    if (error) throw error
    const users = data?.users ?? []
    const found = users.find((u) => u.email?.toLowerCase() === normalized)
    if (found) return found
    if (users.length < 200) break
    page++
  }
  return null
}

async function ensureAdminUser({ label, url, serviceRoleKey, email, password }) {
  console.log(`\n→ ${label} (${url})`)

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let userId
  const existing = await listUsersByEmail(admin, email)

  if (existing) {
    console.log('  usuário já existe — atualizando senha e confirmando e-mail')
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Admin SyncLife', role: 'admin' },
    })
    if (error) throw new Error(`updateUser: ${error.message}`)
    userId = data.user.id
  } else {
    console.log('  criando usuário')
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Admin SyncLife', role: 'admin' },
    })
    if (error) throw new Error(`createUser: ${error.message}`)
    userId = data.user.id
  }

  // Aguarda trigger handle_new_user criar profile
  await new Promise((r) => setTimeout(r, 500))

  const profilePatch = {
    full_name: 'Admin SyncLife',
    onboarding_completed: true,
    plan_type: 'pro',
    theme: 'navy-dark',
    mode: 'jornada',
    active_modules: [
      'panorama',
      'financas',
      'futuro',
      'tempo',
      'corpo',
      'mente',
      'patrimonio',
      'carreira',
      'experiencias',
      'conquistas',
      'configuracoes',
    ],
    updated_at: new Date().toISOString(),
  }

  const { error: profileError } = await admin.from('profiles').upsert(
    { id: userId, ...profilePatch },
    { onConflict: 'id' },
  )

  if (profileError) {
  // fallback update se upsert falhar por colunas ausentes em algum ambiente
    const { error: updateError } = await admin
      .from('profiles')
      .update(profilePatch)
      .eq('id', userId)
    if (updateError) throw new Error(`profile: ${profileError.message} / ${updateError.message}`)
  }

  // smoke test login
  const anonKeyEnv =
    label === 'homolog'
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_HOMOL
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const pub = createClient(url, anonKeyEnv, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error: signInError } = await pub.auth.signInWithPassword({ email, password })
  if (signInError) throw new Error(`login test failed: ${signInError.message}`)

  console.log('  ✓ admin provisionado e login OK')
  return userId
}

async function main() {
  const cli = parseArgs(process.argv.slice(2))
  const env = { ...loadEnvFile(resolve(ROOT, '.env')), ...loadEnvFile(resolve(ROOT, '.env.local')) }
  Object.assign(process.env, env)

  const email = cli.email ?? env.ADMIN_EMAIL ?? DEFAULT_EMAIL
  const password = cli.password ?? env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD
  const accessToken = env.SUPABASE_ACCESS_TOKEN

  const targets = [
    {
      label: 'homolog',
      url: env.NEXT_PUBLIC_SUPABASE_URL_HOMOL,
      serviceRoleKey:
        env.SUPABASE_SERVICE_ROLE_KEY_HOMOL ?? env.SUPABASE_SERVICE_ROLE_KEY,
    },
    {
      label: 'production',
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY_PROD,
    },
  ]

  if (accessToken) {
    for (const t of targets) {
      if (!t.serviceRoleKey && t.url) {
        const ref = projectRefFromUrl(t.url)
        if (ref) {
          try {
            t.serviceRoleKey = await fetchServiceRoleKey(ref, accessToken)
            console.log(`✓ service_role obtida via Management API (${t.label})`)
          } catch (err) {
            console.warn(`⚠ não foi possível obter service_role de ${t.label}: ${err.message}`)
          }
        }
      }
    }
  }

  console.log(`\nProvisionando admin: ${email}`)

  const results = []
  for (const t of targets) {
    if (!t.url) {
      console.warn(`⚠ ${t.label}: URL ausente — pulando`)
      continue
    }
    if (!t.serviceRoleKey) {
      console.warn(`⚠ ${t.label}: service role ausente — pulando`)
      continue
    }
    try {
      const id = await ensureAdminUser({ ...t, email, password })
      results.push({ ...t, id })
    } catch (err) {
      console.warn(`⚠ ${t.label}: ${err instanceof Error ? err.message : err}`)
    }
  }

  if (results.length === 0) {
    console.error('\nNenhum ambiente provisionado. Verifique SUPABASE_SERVICE_ROLE_KEY* no .env.local')
    process.exit(1)
  }

  console.log('\n════════════════════════════════════════')
  console.log('Admin SyncLife — credenciais')
  console.log('════════════════════════════════════════')
  console.log(`E-mail:  ${email}`)
  console.log(`Senha:   ${password}`)
  console.log('Ambientes:')
  for (const r of results) console.log(`  • ${r.label}: ${r.url}`)
  console.log('\nLocal: NEXT_PUBLIC_SUPABASE_ENV=homolog → homolog')
  console.log('       NEXT_PUBLIC_SUPABASE_ENV=production → produção')
}

main().catch((err) => {
  console.error('\n✗ Erro:', err.message ?? err)
  process.exit(1)
})
