'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowLeft, Loader2, Trash2, FileText, Calendar, Tag } from 'lucide-react'
import { ModuleHeader } from '@/components/ui/module-header'
import { useImport, useImportHistory } from '@/hooks/use-import'
import { SLCard } from '@/components/ui/sl-card'
import { SLSelect } from '@/components/ui/sl-select'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

function fmtCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export default function ImportarPage() {
  const {
    step, fileName, fileType,
    parsedData, headers, columnMapping,
    duplicateIndices, skippedIndices,
    importProgress, importTotal, importedCount,
    error,
    categories, categoryAssignments, uncategorizedCount,
    setFile, setColumnMapping, applyMapping,
    toggleSkip, toggleAll,
    setCategoryForTransaction, setCategoryForAll,
    executeImport, reset,
  } = useImport()

  const { batches, isLoading: historyLoading, deleteBatch } = useImportHistory()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showCategorize, setShowCategorize] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) await setFile(f)
  }, [setFile])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) await setFile(f)
  }, [setFile])

  const handleImport = useCallback(async () => {
    // If there are uncategorized transactions, show categorize step first
    if (uncategorizedCount > 0 && !showCategorize) {
      setShowCategorize(true)
      return
    }
    await executeImport()
    toast.success('Importação concluída!')
  }, [executeImport, uncategorizedCount, showCategorize])

  const handleConfirmImport = useCallback(async () => {
    await executeImport()
    toast.success('Importação concluída!')
  }, [executeImport])

  const handleDeleteBatch = useCallback(async (notes: string) => {
    setDeleting(true)
    try {
      const count = await deleteBatch(notes)
      toast.success(`${count} transações excluídas com sucesso!`)
      setConfirmDelete(null)
    } catch {
      toast.error('Erro ao excluir transações')
    } finally {
      setDeleting(false)
    }
  }, [deleteBatch])

  const handleReset = useCallback(() => {
    setShowCategorize(false)
    reset()
  }, [reset])

  const toImportCount = parsedData.filter((_, i) => !skippedIndices.has(i)).length

  // Uncategorized transaction indices (only non-skipped)
  const uncategorizedIndices = parsedData
    .map((_, i) => i)
    .filter(i => !skippedIndices.has(i) && !categoryAssignments.has(i))

  // Steps indicator position
  function getStepPosition(): number {
    if (step === 'upload') return 0
    if (step === 'mapping') return 1
    if (step === 'preview' || step === 'importing') return showCategorize ? 3 : 2
    if (step === 'done') return 4
    return 0
  }
  const currentPos = getStepPosition()

  const INDICATOR_STEPS = showCategorize || step === 'done'
    ? ['Upload', 'Mapeamento', 'Revisão', 'Categorias', 'Concluído']
    : ['Upload', 'Mapeamento', 'Revisão', 'Concluído']

  return (
    <div className="max-w-[800px] mx-auto px-6 py-7 pb-16">
      {/* Header */}
      <ModuleHeader
        icon={Upload}
        iconBg="rgba(16,185,129,.08)"
        iconColor="#10b981"
        title="Importar Extrato"
        subtitle="PDF, CSV (Nubank, Inter, Itaú, Bradesco) ou OFX/QFX"
        className="mb-5"
      >
        <Link href="/financas/transacoes" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] border border-[var(--sl-border)] bg-[var(--sl-s1)] text-[var(--sl-t2)] text-[12px] font-semibold hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
          <ArrowLeft size={13} />
          Voltar
        </Link>
      </ModuleHeader>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {INDICATOR_STEPS.map((label, i) => {
          const isCurrent = i === currentPos
          const isPast = i < currentPos
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <div className={cn('w-8 h-px', isPast ? 'bg-[#10b981]' : 'bg-[var(--sl-border)]')} />}
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium',
                isCurrent && 'bg-[rgba(16,185,129,0.12)] text-[#10b981] font-bold',
                isPast && !isCurrent && 'text-[#10b981]',
                !isCurrent && !isPast && 'text-[var(--sl-t3)]',
              )}>
                {isPast && !isCurrent ? <CheckCircle2 size={12} /> : null}
                {label}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-[rgba(244,63,94,0.06)] border border-[rgba(244,63,94,0.2)] text-[13px] text-[#f43f5e]">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* ═══ STEP: Upload ═══ */}
      {step === 'upload' && (
        <SLCard>
          <div
            className="border-2 border-dashed border-[var(--sl-border)] rounded-2xl p-12 text-center cursor-pointer transition-colors hover:border-[#10b981]/40 hover:bg-[rgba(16,185,129,0.03)]"
            onDrop={handleFileDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={40} className="mx-auto mb-3 text-[var(--sl-t3)]" />
            <p className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)] mb-1">
              Arraste seu arquivo aqui
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] mb-3">
              ou clique para selecionar
            </p>
            <p className="text-[10px] text-[var(--sl-t3)]">
              Formatos aceitos: .pdf, .csv, .ofx, .qfx
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.ofx,.qfx,.pdf"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)]">
            <p className="text-[11px] font-bold text-[var(--sl-t2)] mb-2">Bancos com detecção automática:</p>
            <div className="flex flex-wrap gap-2">
              {['Nubank', 'Inter', 'Itaú', 'Bradesco', 'C6 Bank', 'BTG'].map(bank => (
                <span key={bank} className="px-2 py-1 rounded-md bg-[var(--sl-s3)] text-[10px] font-medium text-[var(--sl-t2)]">
                  {bank}
                </span>
              ))}
            </div>
          </div>
        </SLCard>
      )}

      {/* ═══ STEP: Mapping (CSV only) ═══ */}
      {step === 'mapping' && (
        <SLCard>
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet size={18} className="text-[#10b981]" />
            <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">
              Mapear Colunas — {fileName}
            </p>
          </div>
          <p className="text-[12px] text-[var(--sl-t3)] mb-4">
            Não conseguimos detectar o banco automaticamente. Selecione quais colunas correspondem a cada campo.
          </p>

          <div className="flex flex-col gap-3 mb-5">
            {(['date', 'description', 'amount'] as const).map(field => {
              const labels = { date: 'Data', description: 'Descrição', amount: 'Valor' }
              return (
                <div key={field} className="flex items-center gap-3">
                  <span className="text-[12px] font-semibold text-[var(--sl-t1)] w-24 shrink-0">
                    {labels[field]}
                  </span>
                  <SLSelect
                    value={columnMapping?.[field] ?? ''}
                    onChange={(val) => {
                      setColumnMapping({
                        ...(columnMapping ?? { date: '', description: '', amount: '' }),
                        [field]: val,
                      })
                    }}
                    placeholder="Selecione..."
                    options={headers.map(h => ({ value: h, label: h }))}
                    className="flex-1"
                  />
                </div>
              )
            })}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-[var(--sl-border)] text-[12px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={applyMapping}
              disabled={!columnMapping?.date || !columnMapping?.description || !columnMapping?.amount}
              className="px-4 py-2 rounded-lg bg-[#10b981] text-white text-[12px] font-bold disabled:opacity-40 hover:bg-[#0da876] transition-colors"
            >
              Continuar
            </button>
          </div>
        </SLCard>
      )}

      {/* ═══ STEP: Preview (clean table, no category column) ═══ */}
      {(step === 'preview' || step === 'importing') && !showCategorize && (
        <>
          <SLCard className="mb-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">
                Revisão — {parsedData.length} transações encontradas
              </p>
              <div className="flex items-center gap-2 text-[11px] flex-wrap">
                {duplicateIndices.size > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-[rgba(245,158,11,0.12)] text-[#f59e0b] font-medium">
                    {duplicateIndices.size} possíveis duplicatas
                  </span>
                )}
                <button
                  onClick={() => toggleAll(toImportCount > 0)}
                  className="px-2.5 py-1 rounded-lg border border-[var(--sl-border)] text-[var(--sl-t2)] font-medium hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors"
                >
                  {toImportCount > 0 ? 'Desmarcar todas' : 'Selecionar todas'}
                </button>
                <span className="text-[var(--sl-t3)]">
                  {toImportCount} para importar
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-[var(--sl-s1)]">
                  <tr className="border-b border-[var(--sl-border)]">
                    <th className="text-left py-2 px-2 text-[var(--sl-t3)] font-bold uppercase text-[10px]">
                      <input
                        type="checkbox"
                        checked={toImportCount === parsedData.length}
                        ref={el => { if (el) el.indeterminate = toImportCount > 0 && toImportCount < parsedData.length }}
                        onChange={(e) => toggleAll(!e.target.checked)}
                        className="accent-[#10b981] mr-1 align-middle"
                      />
                      Importar
                    </th>
                    <th className="text-left py-2 px-2 text-[var(--sl-t3)] font-bold uppercase text-[10px]">Data</th>
                    <th className="text-left py-2 px-2 text-[var(--sl-t3)] font-bold uppercase text-[10px]">Descrição</th>
                    <th className="text-right py-2 px-2 text-[var(--sl-t3)] font-bold uppercase text-[10px]">Valor</th>
                    <th className="text-center py-2 px-2 text-[var(--sl-t3)] font-bold uppercase text-[10px]">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((tx, i) => {
                    const isDupe = duplicateIndices.has(i)
                    const isSkipped = skippedIndices.has(i)
                    return (
                      <tr
                        key={i}
                        className={cn(
                          'border-b border-[var(--sl-border)]/50 transition-colors',
                          isDupe && 'bg-[rgba(245,158,11,0.04)]',
                          isSkipped && 'opacity-40',
                        )}
                      >
                        <td className="py-1.5 px-2">
                          <input
                            type="checkbox"
                            checked={!isSkipped}
                            onChange={() => toggleSkip(i)}
                            className="accent-[#10b981]"
                          />
                        </td>
                        <td className="py-1.5 px-2 font-[DM_Mono] text-[var(--sl-t2)] whitespace-nowrap">
                          {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-1.5 px-2 text-[var(--sl-t1)] max-w-[260px] truncate">
                          {tx.description}
                          {isDupe && (
                            <span className="ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded bg-[rgba(245,158,11,0.15)] text-[#f59e0b]">
                              DUPLICATA?
                            </span>
                          )}
                        </td>
                        <td className={cn(
                          'py-1.5 px-2 text-right font-[DM_Mono] font-medium',
                          tx.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]',
                        )}>
                          {tx.type === 'expense' ? '-' : '+'}{fmtCurrency(tx.amount)}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <span className={cn(
                            'px-1.5 py-0.5 rounded text-[9px] font-bold',
                            tx.type === 'income'
                              ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981]'
                              : 'bg-[rgba(244,63,94,0.1)] text-[#f43f5e]',
                          )}>
                            {tx.type === 'income' ? 'RECEITA' : 'DESPESA'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </SLCard>

          {/* Actions */}
          {step === 'preview' && (
            <div className="flex justify-end gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-[var(--sl-border)] text-[12px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={toImportCount === 0}
                className="px-5 py-2 rounded-lg bg-[#10b981] text-white text-[12px] font-bold disabled:opacity-40 hover:bg-[#0da876] transition-colors"
              >
                Importar {toImportCount} transações
              </button>
            </div>
          )}
        </>
      )}

      {/* ═══ STEP: Categorize (only uncategorized transactions) ═══ */}
      {step === 'preview' && showCategorize && (
        <>
          <SLCard className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={16} className="text-[#f59e0b]" />
              <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">
                Classificar Transações
              </p>
            </div>
            <p className="text-[12px] text-[var(--sl-t3)] mb-4">
              {uncategorizedIndices.length} transações não foram classificadas automaticamente. Selecione uma categoria para cada uma.
            </p>

            {/* Bulk assign */}
            {uncategorizedIndices.length > 0 && categories.length > 0 && (
              <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)]">
                <span className="text-[11px] text-[var(--sl-t2)] font-medium">Aplicar a todas sem categoria:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) setCategoryForAll(e.target.value)
                    e.target.value = ''
                  }}
                  defaultValue=""
                  className="text-[11px] px-2 py-1 rounded-lg bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none cursor-pointer"
                >
                  <option value="" disabled>Selecione...</option>
                  <optgroup label="Despesas">
                    {categories.filter(c => c.type === 'expense').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Receitas">
                    {categories.filter(c => c.type === 'income').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-[var(--sl-s1)]">
                  <tr className="border-b border-[var(--sl-border)]">
                    <th className="text-left py-2 px-2 text-[var(--sl-t3)] font-bold uppercase text-[10px]">Data</th>
                    <th className="text-left py-2 px-2 text-[var(--sl-t3)] font-bold uppercase text-[10px]">Descrição</th>
                    <th className="text-right py-2 px-2 text-[var(--sl-t3)] font-bold uppercase text-[10px]">Valor</th>
                    <th className="text-left py-2 px-2 text-[var(--sl-t3)] font-bold uppercase text-[10px]">Categoria</th>
                  </tr>
                </thead>
                <tbody>
                  {uncategorizedIndices.map(idx => {
                    const tx = parsedData[idx]
                    const assignedCatId = categoryAssignments.get(idx) ?? ''
                    const assignedCat = assignedCatId ? categories.find(c => c.id === assignedCatId) : null
                    const typeCats = categories.filter(c => c.type === tx.type)
                    return (
                      <tr key={idx} className="border-b border-[var(--sl-border)]/50">
                        <td className="py-2 px-2 font-[DM_Mono] text-[var(--sl-t2)] whitespace-nowrap">
                          {new Date(tx.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-2 px-2 text-[var(--sl-t1)] max-w-[240px] truncate">
                          {tx.description}
                        </td>
                        <td className={cn(
                          'py-2 px-2 text-right font-[DM_Mono] font-medium whitespace-nowrap',
                          tx.type === 'income' ? 'text-[#10b981]' : 'text-[#f43f5e]',
                        )}>
                          {tx.type === 'expense' ? '-' : '+'}{fmtCurrency(tx.amount)}
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={assignedCatId}
                            onChange={(e) => setCategoryForTransaction(idx, e.target.value || null)}
                            className={cn(
                              'text-[11px] w-full max-w-[160px] px-2 py-1.5 rounded-lg border outline-none transition-colors',
                              assignedCat
                                ? 'bg-[var(--sl-s2)] border-[#10b981]/30 text-[var(--sl-t1)]'
                                : 'bg-[rgba(245,158,11,0.06)] border-[rgba(245,158,11,0.3)] text-[#f59e0b]',
                            )}
                          >
                            <option value="">Selecione...</option>
                            {typeCats.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Categorized count feedback */}
            {uncategorizedIndices.length === 0 && (
              <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.15)]">
                <CheckCircle2 size={14} className="text-[#10b981]" />
                <span className="text-[12px] text-[#10b981] font-medium">
                  Todas as transações foram classificadas!
                </span>
              </div>
            )}
          </SLCard>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setShowCategorize(false)}
              className="px-4 py-2 rounded-lg border border-[var(--sl-border)] text-[12px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
            >
              Voltar
            </button>
            <div className="flex items-center gap-2">
              {uncategorizedIndices.length > 0 && (
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-2 rounded-lg border border-[var(--sl-border)] text-[12px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
                >
                  Pular e importar ({uncategorizedIndices.length} sem categoria)
                </button>
              )}
              <button
                onClick={handleConfirmImport}
                disabled={uncategorizedIndices.length > 0}
                className="px-5 py-2 rounded-lg bg-[#10b981] text-white text-[12px] font-bold disabled:opacity-40 hover:bg-[#0da876] transition-colors"
              >
                Importar {toImportCount} transações
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══ Importing progress ═══ */}
      {step === 'importing' && (
        <SLCard className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 size={16} className="animate-spin text-[#10b981]" />
            <p className="text-[13px] font-semibold text-[var(--sl-t1)]">
              Importando... {importProgress}/{importTotal}
            </p>
          </div>
          <div className="w-full bg-[var(--sl-s3)] rounded-full h-1.5">
            <div
              className="h-full rounded-full bg-[#10b981] transition-[width] duration-300"
              style={{ width: `${importTotal > 0 ? (importProgress / importTotal) * 100 : 0}%` }}
            />
          </div>
        </SLCard>
      )}

      {/* ═══ STEP: Done ═══ */}
      {step === 'done' && (
        <SLCard>
          <div className="text-center py-8">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-[#10b981]" />
            <h2 className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)] mb-1">
              Importação concluída!
            </h2>
            <p className="text-[13px] text-[var(--sl-t2)] mb-5">
              {importedCount} transações importadas de <strong>{fileName}</strong>
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-[var(--sl-border)] text-[12px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
              >
                Importar outro arquivo
              </button>
              <Link
                href="/financas/transacoes"
                className="px-4 py-2 rounded-lg bg-[#10b981] text-white text-[12px] font-bold hover:bg-[#0da876] transition-colors"
              >
                Ver transações
              </Link>
            </div>
          </div>
        </SLCard>
      )}

      {/* ═══ Import History ═══ */}
      {batches.length > 0 && (
        <div className="mt-8">
          <h2 className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)] mb-3">
            Histórico de Importações
          </h2>
          <div className="flex flex-col gap-3">
            {batches.map((batch) => (
              <SLCard key={batch.notes} className="!p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[rgba(16,185,129,0.08)] flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-[#10b981]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--sl-t1)] truncate">
                      {batch.fileName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--sl-t3)]">
                      <span className="font-[DM_Mono]">{batch.count} transações</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {fmtDate(batch.dateRange.min)}
                        {batch.dateRange.min !== batch.dateRange.max && ` — ${fmtDate(batch.dateRange.max)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px]">
                      {batch.totalIncome > 0 && (
                        <span className="text-[#10b981] font-[DM_Mono] font-medium">
                          +{fmtCurrency(batch.totalIncome)}
                        </span>
                      )}
                      {batch.totalExpense > 0 && (
                        <span className="text-[#f43f5e] font-[DM_Mono] font-medium">
                          -{fmtCurrency(batch.totalExpense)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button / Confirmation */}
                  {confirmDelete === batch.notes ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setConfirmDelete(null)}
                        disabled={deleting}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--sl-border)] text-[11px] text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors disabled:opacity-40"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDeleteBatch(batch.notes)}
                        disabled={deleting}
                        className="px-2.5 py-1.5 rounded-lg bg-[#f43f5e] text-white text-[11px] font-bold hover:bg-[#e11d48] transition-colors disabled:opacity-40 flex items-center gap-1"
                      >
                        {deleting ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={11} />
                        )}
                        Confirmar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(batch.notes)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[rgba(244,63,94,0.06)] transition-colors shrink-0"
                      aria-label={`Excluir importação ${batch.fileName}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </SLCard>
            ))}
          </div>
        </div>
      )}

      {historyLoading && batches.length === 0 && (
        <div className="mt-8">
          <div className="h-5 w-48 rounded bg-[var(--sl-s2)] animate-pulse mb-3" />
          <div className="h-20 rounded-2xl bg-[var(--sl-s2)] animate-pulse" />
        </div>
      )}
    </div>
  )
}
