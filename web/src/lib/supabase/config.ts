/**
 * Resolve Supabase URL e anon key com base no ambiente.
 * Para desenvolvimento local: use NEXT_PUBLIC_SUPABASE_ENV=homolog para testar contra homologação.
 * Em Vercel: Production usa variáveis padrão, Preview usa variáveis _HOMOL (configuradas no dashboard).
 */
function getSupabaseConfig() {
  const env = process.env.NEXT_PUBLIC_SUPABASE_ENV
  const useHomolog = env === 'homolog'

  const url = useHomolog
    ? process.env.NEXT_PUBLIC_SUPABASE_URL_HOMOL
    : process.env.NEXT_PUBLIC_SUPABASE_URL

  const anonKey = useHomolog
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_HOMOL
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      `Supabase config missing. Env=${env ?? 'production'}. ` +
        `Set NEXT_PUBLIC_SUPABASE_URL/ANON_KEY or NEXT_PUBLIC_SUPABASE_URL_HOMOL/ANON_KEY_HOMOL`
    )
  }

  return { url, anonKey }
}

export const supabaseConfig = getSupabaseConfig()
