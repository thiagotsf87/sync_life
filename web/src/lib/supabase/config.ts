/**
 * Resolve Supabase URL e anon key com base no ambiente.
 * Para desenvolvimento local: use NEXT_PUBLIC_SUPABASE_ENV=homolog para testar contra homologação.
 * Em Vercel: Production usa variáveis padrão, Preview usa variáveis _HOMOL (configuradas no dashboard).
 */
function getSupabaseConfig() {
  const env = process.env.NEXT_PUBLIC_SUPABASE_ENV
  const useHomolog = env === 'homolog'
  const isVercelPreview = process.env.VERCEL_ENV === 'preview'

  let url = useHomolog
    ? process.env.NEXT_PUBLIC_SUPABASE_URL_HOMOL
    : process.env.NEXT_PUBLIC_SUPABASE_URL
  let anonKey = useHomolog
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_HOMOL
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fallback: em Preview da Vercel, se vars de prod não existem mas _HOMOL existem, usa _HOMOL
  if ((!url || !anonKey) && isVercelPreview) {
    const homolUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_HOMOL
    const homolKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_HOMOL
    if (homolUrl && homolKey) {
      url = homolUrl
      anonKey = homolKey
    }
  }

  if (!url || !anonKey) {
    throw new Error(
      `Supabase config missing. Env=${env ?? 'production'}. ` +
        `Set NEXT_PUBLIC_SUPABASE_URL/ANON_KEY or NEXT_PUBLIC_SUPABASE_URL_HOMOL/ANON_KEY_HOMOL`
    )
  }

  return { url, anonKey }
}

export const supabaseConfig = getSupabaseConfig()
