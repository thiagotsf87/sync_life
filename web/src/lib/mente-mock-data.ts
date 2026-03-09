/**
 * Mock data para validação visual do módulo Mente Mobile.
 * Usado como fallback quando os dados reais do Supabase estão vazios.
 */

import type {
  StudyTrack, StudyTrackStep, FocusSession, StudyStreak,
} from '@/hooks/use-mente'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}
function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}
function hoursAgo(hours: number): string {
  const d = new Date()
  d.setHours(d.getHours() - hours)
  return d.toISOString()
}

const UID = 'mock-user-000'

// ─── Trilhas ──────────────────────────────────────────────────────────────────

const stepsReact: StudyTrackStep[] = [
  { id: 'rs1', track_id: 'tr1', title: 'Hooks avançados (useMemo, useCallback)', is_completed: true, completed_at: daysAgo(30), sort_order: 1, notes: null, created_at: daysAgo(45) },
  { id: 'rs2', track_id: 'tr1', title: 'Context API + Zustand', is_completed: true, completed_at: daysAgo(25), sort_order: 2, notes: null, created_at: daysAgo(45) },
  { id: 'rs3', track_id: 'tr1', title: 'React Query / TanStack', is_completed: true, completed_at: daysAgo(18), sort_order: 3, notes: null, created_at: daysAgo(45) },
  { id: 'rs4', track_id: 'tr1', title: 'Testes com Vitest + Testing Library', is_completed: true, completed_at: daysAgo(10), sort_order: 4, notes: null, created_at: daysAgo(45) },
  { id: 'rs5', track_id: 'tr1', title: 'Server Components (Next.js App Router)', is_completed: false, completed_at: null, sort_order: 5, notes: null, created_at: daysAgo(45) },
  { id: 'rs6', track_id: 'tr1', title: 'Performance e Suspense', is_completed: false, completed_at: null, sort_order: 6, notes: null, created_at: daysAgo(45) },
  { id: 'rs7', track_id: 'tr1', title: 'Projeto final: Dashboard completo', is_completed: false, completed_at: null, sort_order: 7, notes: null, created_at: daysAgo(45) },
]

const stepsEnglish: StudyTrackStep[] = [
  { id: 'es1', track_id: 'tr2', title: 'Grammar B2 — Verbos modais', is_completed: true, completed_at: daysAgo(55), sort_order: 1, notes: null, created_at: daysAgo(62) },
  { id: 'es2', track_id: 'tr2', title: 'Vocabulário técnico (500 palavras)', is_completed: true, completed_at: daysAgo(42), sort_order: 2, notes: null, created_at: daysAgo(62) },
  { id: 'es3', track_id: 'tr2', title: 'Listening — Podcasts diários', is_completed: true, completed_at: daysAgo(28), sort_order: 3, notes: null, created_at: daysAgo(62) },
  { id: 'es4', track_id: 'tr2', title: 'Speaking — Italki 8 aulas', is_completed: false, completed_at: null, sort_order: 4, notes: null, created_at: daysAgo(62) },
  { id: 'es5', track_id: 'tr2', title: 'Writing — Email e relatório profissional', is_completed: false, completed_at: null, sort_order: 5, notes: null, created_at: daysAgo(62) },
  { id: 'es6', track_id: 'tr2', title: 'Cambridge B2 — Mock test', is_completed: false, completed_at: null, sort_order: 6, notes: null, created_at: daysAgo(62) },
  { id: 'es7', track_id: 'tr2', title: 'Cambridge B2 — Prova oficial', is_completed: false, completed_at: null, sort_order: 7, notes: null, created_at: daysAgo(62) },
  { id: 'es8', track_id: 'tr2', title: 'Conversação avançada C1', is_completed: false, completed_at: null, sort_order: 8, notes: null, created_at: daysAgo(62) },
]

const stepsAWS: StudyTrackStep[] = [
  { id: 'as1', track_id: 'tr3', title: 'Cloud Foundations — EC2, S3, IAM', is_completed: true, completed_at: daysAgo(12), sort_order: 1, notes: null, created_at: daysAgo(15) },
  { id: 'as2', track_id: 'tr3', title: 'Networking — VPC, Route53, CloudFront', is_completed: true, completed_at: daysAgo(6), sort_order: 2, notes: null, created_at: daysAgo(15) },
  { id: 'as3', track_id: 'tr3', title: 'Databases — RDS, DynamoDB, ElastiCache', is_completed: false, completed_at: null, sort_order: 3, notes: null, created_at: daysAgo(15) },
  { id: 'as4', track_id: 'tr3', title: 'Serverless — Lambda, API Gateway, SQS', is_completed: false, completed_at: null, sort_order: 4, notes: null, created_at: daysAgo(15) },
  { id: 'as5', track_id: 'tr3', title: 'Security — KMS, Secrets Manager, WAF', is_completed: false, completed_at: null, sort_order: 5, notes: null, created_at: daysAgo(15) },
  { id: 'as6', track_id: 'tr3', title: 'Architecture patterns — Well-Architected', is_completed: false, completed_at: null, sort_order: 6, notes: null, created_at: daysAgo(15) },
  { id: 'as7', track_id: 'tr3', title: 'Labs práticos — 10 projetos', is_completed: false, completed_at: null, sort_order: 7, notes: null, created_at: daysAgo(15) },
  { id: 'as8', track_id: 'tr3', title: 'Mock exams — 3 simulados completos', is_completed: false, completed_at: null, sort_order: 8, notes: null, created_at: daysAgo(15) },
  { id: 'as9', track_id: 'tr3', title: 'Revisão final e revisão de flashcards', is_completed: false, completed_at: null, sort_order: 9, notes: null, created_at: daysAgo(15) },
  { id: 'as10', track_id: 'tr3', title: 'Exame oficial SAA-C03', is_completed: false, completed_at: null, sort_order: 10, notes: null, created_at: daysAgo(15) },
]

export const MOCK_TRACKS: StudyTrack[] = [
  {
    id: 'tr1', user_id: UID,
    name: 'React Avançado',
    category: 'technology',
    status: 'in_progress',
    target_date: daysFromNow(30),
    progress: 57,
    total_hours: 12.5,
    cost: null, linked_skill_id: null, linked_objective_id: null, notes: null,
    steps: stepsReact,
    created_at: daysAgo(45), updated_at: daysAgo(2),
  },
  {
    id: 'tr2', user_id: UID,
    name: 'Inglês Fluente',
    category: 'languages',
    status: 'in_progress',
    target_date: daysFromNow(90),
    progress: 37,
    total_hours: 22.0,
    cost: 450, linked_skill_id: null, linked_objective_id: null, notes: 'Meta: Cambridge B2 até dezembro',
    steps: stepsEnglish,
    created_at: daysAgo(62), updated_at: daysAgo(1),
  },
  {
    id: 'tr3', user_id: UID,
    name: 'AWS Solutions Architect',
    category: 'certification',
    status: 'in_progress',
    target_date: daysFromNow(60),
    progress: 20,
    total_hours: 4.5,
    cost: 320, linked_skill_id: null, linked_objective_id: null, notes: null,
    steps: stepsAWS,
    created_at: daysAgo(15), updated_at: daysAgo(0),
  },
]

// ─── Sessões de foco ───────────────────────────────────────────────────────────

export const MOCK_SESSIONS: FocusSession[] = [
  // Hoje
  { id: 'fs1', user_id: UID, track_id: 'tr1', duration_minutes: 30, focus_minutes: 25, break_minutes: 5, cycles_completed: 1, session_notes: 'Server Components', recorded_at: hoursAgo(2), created_at: hoursAgo(2), track: { name: 'React Avançado' } },
  { id: 'fs2', user_id: UID, track_id: 'tr3', duration_minutes: 55, focus_minutes: 50, break_minutes: 5, cycles_completed: 2, session_notes: null, recorded_at: hoursAgo(5), created_at: hoursAgo(5), track: { name: 'AWS Solutions Architect' } },
  // Ontem
  { id: 'fs3', user_id: UID, track_id: 'tr2', duration_minutes: 55, focus_minutes: 50, break_minutes: 5, cycles_completed: 2, session_notes: 'Speaking prática', recorded_at: daysAgo(1), created_at: daysAgo(1), track: { name: 'Inglês Fluente' } },
  { id: 'fs4', user_id: UID, track_id: 'tr1', duration_minutes: 30, focus_minutes: 25, break_minutes: 5, cycles_completed: 1, session_notes: null, recorded_at: daysAgo(1), created_at: daysAgo(1), track: { name: 'React Avançado' } },
  // 2 dias atrás
  { id: 'fs5', user_id: UID, track_id: 'tr3', duration_minutes: 85, focus_minutes: 75, break_minutes: 10, cycles_completed: 3, session_notes: 'Networking VPC', recorded_at: daysAgo(2), created_at: daysAgo(2), track: { name: 'AWS Solutions Architect' } },
  // 3 dias atrás
  { id: 'fs6', user_id: UID, track_id: 'tr2', duration_minutes: 30, focus_minutes: 25, break_minutes: 5, cycles_completed: 1, session_notes: null, recorded_at: daysAgo(3), created_at: daysAgo(3), track: { name: 'Inglês Fluente' } },
  // 4 dias atrás
  { id: 'fs7', user_id: UID, track_id: 'tr1', duration_minutes: 55, focus_minutes: 50, break_minutes: 5, cycles_completed: 2, session_notes: 'React Query mutations', recorded_at: daysAgo(4), created_at: daysAgo(4), track: { name: 'React Avançado' } },
  // 5 dias atrás
  { id: 'fs8', user_id: UID, track_id: 'tr3', duration_minutes: 30, focus_minutes: 25, break_minutes: 5, cycles_completed: 1, session_notes: null, recorded_at: daysAgo(5), created_at: daysAgo(5), track: { name: 'AWS Solutions Architect' } },
]

// ─── Streak ───────────────────────────────────────────────────────────────────

export const MOCK_STREAK: StudyStreak = {
  current_streak: 12,
  longest_streak: 28,
  last_study_date: new Date().toISOString().split('T')[0],
}
