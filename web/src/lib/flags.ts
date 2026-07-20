/**
 * Feature flag da camada Coach OS (overlays + hero + cross).
 * Rollback de 1 linha: setar NEXT_PUBLIC_COACH_OS=off desliga tudo.
 * Lida no client (AppShell) → precisa do prefixo NEXT_PUBLIC_.
 */
export const COACH_OS_ENABLED = process.env.NEXT_PUBLIC_COACH_OS !== 'off'
