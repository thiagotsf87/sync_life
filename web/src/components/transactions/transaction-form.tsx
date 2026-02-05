'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories'
import { formatCurrencyInput } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, Check, RefreshCw } from 'lucide-react'

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  editTransaction?: {
    id: string
    type: 'income' | 'expense'
    description: string
    amount: number
    category_id: string
    date: string
  }
}

export function TransactionForm({
  open,
  onOpenChange,
  onSuccess,
  editTransaction,
}: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(editTransaction?.type || 'expense')
  const [description, setDescription] = useState(editTransaction?.description || '')
  const [value, setValue] = useState(editTransaction ? formatCurrencyInput(String(editTransaction.amount * 100)) : '')
  const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState(editTransaction?.category_id || '')
  const [notes, setNotes] = useState('')
  const [isRecurrent, setIsRecurrent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Por favor, preencha a descrição')
      return
    }
    if (!value) {
      toast.error('Por favor, preencha o valor')
      return
    }
    if (!categoryId) {
      toast.error('Por favor, selecione uma categoria')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Usuário não autenticado')
        return
      }

      // Parse the currency value
      const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'))

      if (editTransaction) {
        // Update existing transaction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('transactions')
          .update({
            type,
            description,
            amount: numericValue,
            category_id: categoryId,
            date,
          })
          .eq('id', editTransaction.id)

        if (error) throw error
        toast.success('Transação atualizada com sucesso!')
      } else {
        // Create new transaction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from('transactions').insert({
          user_id: user.id,
          type,
          description,
          amount: numericValue,
          category_id: categoryId,
          date,
        })

        if (error) throw error
        toast.success('Transação criada com sucesso!')
      }

      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error('Error saving transaction:', error)
      toast.error('Erro ao salvar transação')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setType('expense')
    setDescription('')
    setValue('')
    setDate(new Date().toISOString().split('T')[0])
    setCategoryId('')
    setNotes('')
    setIsRecurrent(false)
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatCurrencyInput(e.target.value))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editTransaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transaction type toggle */}
          <div>
            <Label className="text-slate-400 mb-3 block">Tipo de transação</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('expense')
                  setCategoryId('')
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  type === 'expense'
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white ring-2 ring-rose-500/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-rose-500/50 hover:text-rose-400'
                }`}
              >
                <ArrowDown className="w-5 h-5" />
                Despesa
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income')
                  setCategoryId('')
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  type === 'income'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ring-2 ring-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400'
                }`}
              >
                <ArrowUp className="w-5 h-5" />
                Receita
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-slate-400">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Supermercado, Salário, Netflix..."
              className="mt-2 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Value and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value" className="text-slate-400">Valor</Label>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                <Input
                  id="value"
                  value={value}
                  onChange={handleValueChange}
                  placeholder="0,00"
                  className="pl-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-right font-semibold"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date" className="text-slate-400">Data</Label>
              <Input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-2 bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label className="text-slate-400 mb-3 block">Categoria</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800 border-2 transition-all ${
                    categoryId === category.id
                      ? 'border-[var(--color-sync-500)] bg-[var(--color-sync-500)]/10'
                      : 'border-transparent hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xs text-slate-400">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-slate-400">
              Observações <span className="text-slate-600">(opcional)</span>
            </Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Adicione detalhes sobre esta transação..."
              className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-[var(--color-sync-500)] transition-all resize-none"
            />
          </div>

          {/* Recurrence toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Transação recorrente</p>
                <p className="text-xs text-slate-500">Repetir todo mês automaticamente</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurrent(!isRecurrent)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isRecurrent ? 'bg-[var(--color-sync-500)]' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full transition-transform ${
                  isRecurrent ? 'translate-x-5 bg-white' : 'bg-slate-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-[var(--color-sync-500)] hover:bg-[var(--color-sync-600)] text-white"
          >
            <Check className="w-5 h-5 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar transação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
