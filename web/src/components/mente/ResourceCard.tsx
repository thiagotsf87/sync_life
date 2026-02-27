'use client'

import { Link, BookOpen, Play, FileText, StickyNote, FileQuestion, Trash2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StudyResource, ResourceType, ResourceStatus } from '@/hooks/use-mente'
import { RESOURCE_STATUS_LABELS } from '@/hooks/use-mente'

interface ResourceCardProps {
  resource: StudyResource
  onUpdateStatus?: (id: string, status: ResourceStatus) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const TYPE_ICONS: Record<ResourceType, React.ReactNode> = {
  link: <Link size={14} />,
  book: <BookOpen size={14} />,
  video: <Play size={14} />,
  pdf: <FileText size={14} />,
  note: <StickyNote size={14} />,
  other: <FileQuestion size={14} />,
}

const STATUS_COLORS: Record<ResourceStatus, string> = {
  to_study: '#6e90b8',
  studying: '#f59e0b',
  completed: '#10b981',
}

const STATUS_SEQUENCE: ResourceStatus[] = ['to_study', 'studying', 'completed']

// RN-MNT-21: render basic markdown in personal_notes (bold, italic, line breaks)
function renderMarkdown(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

export function ResourceCard({ resource, onUpdateStatus, onDelete }: ResourceCardProps) {
  function cycleStatus() {
    if (!onUpdateStatus) return
    const currentIdx = STATUS_SEQUENCE.indexOf(resource.status)
    const nextStatus = STATUS_SEQUENCE[(currentIdx + 1) % STATUS_SEQUENCE.length]
    onUpdateStatus(resource.id, nextStatus)
  }

  const statusColor = STATUS_COLORS[resource.status]

  return (
    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl p-4 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'var(--sl-s3)', color: '#a855f7' }}
        >
          {TYPE_ICONS[resource.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[13px] font-semibold text-[var(--sl-t1)] leading-tight truncate">
              {resource.title}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-[var(--sl-s3)] transition-colors"
                >
                  <ExternalLink size={12} className="text-[var(--sl-t3)]" />
                </a>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(resource.id)}
                  className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors"
                >
                  <Trash2 size={12} className="text-[var(--sl-t3)]" />
                </button>
              )}
            </div>
          </div>

          {resource.personal_notes && (
            <p
              className="text-[11px] text-[var(--sl-t3)] mt-0.5 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(resource.personal_notes) }}
            />
          )}

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={cycleStatus}
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border',
                'hover:opacity-80'
              )}
              style={{ color: statusColor, borderColor: statusColor + '50', background: statusColor + '15' }}
            >
              {RESOURCE_STATUS_LABELS[resource.status]}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
