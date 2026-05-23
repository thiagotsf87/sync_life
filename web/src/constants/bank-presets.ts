export interface BankPreset {
  bank: string
  icon: string
  color: string
  type: 'checking' | 'savings' | 'investment' | 'wallet'
}

export const BANK_PRESETS: BankPreset[] = [
  { bank: 'Nubank',          icon: '🟣', color: '#820AD1', type: 'checking' },
  { bank: 'Inter',           icon: '🟠', color: '#FF7A00', type: 'checking' },
  { bank: 'Itaú',            icon: '🟠', color: '#EC7000', type: 'checking' },
  { bank: 'Bradesco',        icon: '🔴', color: '#CC092F', type: 'checking' },
  { bank: 'Banco do Brasil', icon: '🟡', color: '#FFED00', type: 'checking' },
  { bank: 'Caixa',           icon: '🔵', color: '#005CA9', type: 'checking' },
  { bank: 'Santander',       icon: '🔴', color: '#CC0000', type: 'checking' },
  { bank: 'C6 Bank',         icon: '⚫', color: '#242424', type: 'checking' },
  { bank: 'BTG',             icon: '🔵', color: '#1C3D73', type: 'checking' },
  { bank: 'PicPay',          icon: '🟢', color: '#21C25E', type: 'wallet'   },
  { bank: 'Mercado Pago',    icon: '🔵', color: '#009EE3', type: 'wallet'   },
  { bank: 'Carteira',        icon: '💵', color: '#10b981', type: 'wallet'   },
]

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking:   'Conta Corrente',
  savings:    'Poupança',
  investment: 'Investimento',
  wallet:     'Carteira',
}
