-- ============================================================
-- Fase 3: Módulo Metas
-- ============================================================

-- ── 1. Tabela goals ─────────────────────────────────────────
create table if not exists public.goals (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  description         text,
  icon                text not null default '🎯',
  category            text not null default 'outros',
  goal_type           text not null default 'monetary' check (goal_type in ('monetary', 'habit')),
  target_amount       numeric(12,2) not null default 0,
  current_amount      numeric(12,2) not null default 0,
  monthly_contribution numeric(12,2) not null default 0,
  target_date         date,
  start_date          date not null default current_date,
  status              text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  completed_at        timestamptz,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── 2. Tabela goal_contributions ────────────────────────────
create table if not exists public.goal_contributions (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid not null references public.goals(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric(12,2) not null,
  date       date not null default current_date,
  notes      text,
  created_at timestamptz not null default now()
);

-- ── 3. Tabela goal_milestones ────────────────────────────────
create table if not exists public.goal_milestones (
  id         uuid primary key default gen_random_uuid(),
  goal_id    uuid not null references public.goals(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  target_pct integer not null check (target_pct in (25, 50, 75, 100)),
  reached_at timestamptz,
  created_at timestamptz not null default now()
);

-- ── 4. Índices ───────────────────────────────────────────────
create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists goals_status_idx on public.goals(status);
create index if not exists goal_contributions_goal_id_idx on public.goal_contributions(goal_id);
create index if not exists goal_contributions_user_id_idx on public.goal_contributions(user_id);
create index if not exists goal_milestones_goal_id_idx on public.goal_milestones(goal_id);

-- ── 5. Trigger updated_at ───────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists goals_updated_at on public.goals;
create trigger goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- ── 6. RLS ──────────────────────────────────────────────────
alter table public.goals enable row level security;
alter table public.goal_contributions enable row level security;
alter table public.goal_milestones enable row level security;

-- goals policies
drop policy if exists "goals_select" on public.goals;
create policy "goals_select" on public.goals
  for select using (auth.uid() = user_id);

drop policy if exists "goals_insert" on public.goals;
create policy "goals_insert" on public.goals
  for insert with check (auth.uid() = user_id);

drop policy if exists "goals_update" on public.goals;
create policy "goals_update" on public.goals
  for update using (auth.uid() = user_id);

drop policy if exists "goals_delete" on public.goals;
create policy "goals_delete" on public.goals
  for delete using (auth.uid() = user_id);

-- goal_contributions policies
drop policy if exists "goal_contributions_select" on public.goal_contributions;
create policy "goal_contributions_select" on public.goal_contributions
  for select using (auth.uid() = user_id);

drop policy if exists "goal_contributions_insert" on public.goal_contributions;
create policy "goal_contributions_insert" on public.goal_contributions
  for insert with check (auth.uid() = user_id);

drop policy if exists "goal_contributions_delete" on public.goal_contributions;
create policy "goal_contributions_delete" on public.goal_contributions
  for delete using (auth.uid() = user_id);

-- goal_milestones policies
drop policy if exists "goal_milestones_select" on public.goal_milestones;
create policy "goal_milestones_select" on public.goal_milestones
  for select using (auth.uid() = user_id);

drop policy if exists "goal_milestones_insert" on public.goal_milestones;
create policy "goal_milestones_insert" on public.goal_milestones
  for insert with check (auth.uid() = user_id);

drop policy if exists "goal_milestones_update" on public.goal_milestones;
create policy "goal_milestones_update" on public.goal_milestones
  for update using (auth.uid() = user_id);
