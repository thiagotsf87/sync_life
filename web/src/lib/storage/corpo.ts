import { createClient } from '@/lib/supabase/client'

const CORPO_BUCKET = 'corpo-files'

export async function uploadCorpoFile(file: File, folder: 'appointments' | 'weight-progress'): Promise<string> {
  const supabase = createClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(CORPO_BUCKET)
    .upload(path, file, { upsert: false })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(CORPO_BUCKET).getPublicUrl(path)
  if (!data?.publicUrl) throw new Error('Erro ao gerar URL pública')
  return data.publicUrl
}

