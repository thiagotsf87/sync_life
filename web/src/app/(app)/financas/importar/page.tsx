'use client'

import { useCallback, useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'
import { ModuleHeader } from '@/components/ui/module-header'
import { useImport } from '@/hooks/use-import'
import { SLCard } from '@/components/ui/sl-card'
import { SLSelect } from '@/components/ui/sl-select'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'

function fmtCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ImportarPage() {
  const {
    step, fileName, fileType,
    parsedData, headers, columnMapping,
    duplicateIndices, skippedIndices,
    importProgress, importTotal, importedCount,
    error,
    setFile, setColumnMapping, applyMapping,
    toggleSkip, executeImport, reset,
  } = useImport()

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
    await executeImport()
    toast.success('Importação concluída!')
  }, [executeImport])

  const toImportCount = parsedData.filter((_, i) => !skippedIndices.has(i)).length

  return (
    <div className="max-w-[800px] mx-auto px-6 py-7 pb-16">
      {/* Header */}
      <ModuleHeader
        icon={Upload}
        iconBg="rgba(16,185,129,.08)"
        iconColor="#10b981"
        title="Importar Extrato"
        subtitle="CSV (Nubank, Inter, Itaú, Bradesco) ou OFX/QFX"
        className="mb-5"
      >
        <Link href="/financas/transacoes" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] border border-[var(--sl-border)] bg-[var(--sl-s1)] text-[var(--sl-t2)] text-[12px] font-semibold hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
          <ArrowLeft size={13} />
          Voltar
        </Link>
      </ModuleHeader>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {(['upload', 'mapping', 'preview', 'done'] as const).map((s, i) => {
          const labels = ['Upload', 'Mapeamento', 'Revisão', 'Concluído']
          const isCurrent = step === s || (step === 'importing' && s === 'preview')
          const isPast = (['upload', 'mapping', 'preview', 'importing', 'done'] as const).indexOf(step) > i
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={cn('w-8 h-px', isPast ? 'bg-[#10b981]' : 'bg-[var(--sl-border)]')} />}
              <div className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium',
                isCurrent && 'bg-[rgba(16,185,129,0.12)] text-[#10b981] font-bold',
                isPast && !isCurrent && 'text-[#10b981]',
                !isCurrent && !isPast && 'text-[var(--sl-t3)]',
              )}>
                {isPast && !isCurrent ? <CheckCircle2 size={12} /> : null}
                {labels[i]}
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
              Formatos aceitos: .csv, .ofx, .qfx
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.ofx,.qfx"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)]">
            <p className="text-[11px] font-bold text-[var(--sl-t2)] mb-2">Bancos com detecção automática:</p>
            <div className="flex flex-wrap gap-2">
              {['Nubank', 'Inter', 'Itaú', 'Bradesco'].map(bank => (
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
              onClick={reset}
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

      {/* ═══ STEP: Preview ═══ */}
      {(step === 'preview' || step === 'importing') && (
        <>
          <SLCard className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)]">
                Revisão — {parsedData.length} transações encontradas
              </p>
              <div className="flex items-center gap-2 text-[11px]">
                {duplicateIndices.size > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-[rgba(245,158,11,0.12)] text-[#f59e0b] font-medium">
                    {duplicateIndices.size} possíveis duplicatas
                  </span>
                )}
                <span className="text-[var(--sl-t3)]">
                  {toImportCount} para importar
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-[var(--sl-s1)]">
                  <tr className="border-b border-[var(--sl-border)]">
                    <th className="text-left py-2 px-2 text-[var(--sl-t3)] font-bold uppercase text-[10px]">Pular</th>
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
                            checked={isSkipped}
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

          {/* Import progress */}
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

          {/* Actions */}
          {step === 'preview' && (
            <div className="flex justify-end gap-2">
              <button
                onClick={reset}
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
                onClick={reset}
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
    </div>
  )
}
