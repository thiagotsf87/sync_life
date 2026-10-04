-- 028_fase1_sy.sql : Fase 1 do rollout v5. Conversa com Sy persistida + intencao composta.
-- Plano: docs/superpowers/plans/2026-10-04-fase1-implementacao-web.md (Task 4)
--
-- Tabelas tocadas pelas funcoes (schema conferido nas migrations reais):
--   study_tracks (005)            user_id -> profiles, category CHECK inclui 'languages', updated_at sem trigger (app grava manualmente)
--   skills (005)                  user_id -> profiles, category CHECK inclui 'language', updated_at sem trigger (app grava manualmente)
--   skill_study_tracks (005)      PK (skill_id, track_id), sem RLS
--   recurring_transactions (002)  amount CHECK > 0, type/frequency CHECK, start_date NOT NULL, trigger updated_at
--   agenda_events (004)           type/date/start_time/end_time TEXT, trigger updated_at
--   goals (003)                   user_id -> auth.users, goal_type CHECK ('monetary','habit'), category livre, trigger updated_at

-- ─── 1. coach_messages ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coach_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  module_id  TEXT NOT NULL DEFAULT 'panorama',
  fontes     JSONB NOT NULL DEFAULT '[]',
  kind       TEXT NOT NULL DEFAULT 'mensagem' CHECK (kind IN ('mensagem', 'acao', 'intencao', 'nota')),
  ref_id     UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coach_messages_user_day
  ON coach_messages (user_id, created_at DESC);

ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own coach messages" ON coach_messages;
CREATE POLICY "Users can manage own coach messages"
  ON coach_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 2. intencoes ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS intencoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  texto       TEXT NOT NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN ('iniciar_curso')),
  proposta    JSONB NOT NULL,
  caminho     TEXT,
  -- lista de registros criados: [{tabela, id, rotulo, href}]
  aplicado    JSONB NOT NULL DEFAULT '[]',
  status      TEXT NOT NULL DEFAULT 'em_aberto' CHECK (status IN ('em_aberto', 'aplicada', 'desfeita')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  aplicada_em TIMESTAMPTZ,
  desfeita_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS intencoes_user_status
  ON intencoes (user_id, status, created_at DESC);

ALTER TABLE intencoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own intencoes" ON intencoes;
CREATE POLICY "Users can manage own intencoes"
  ON intencoes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 3. aplicar_intencao ───────────────────────────────────────────────────
-- Recebe os registros ja validados pelo servidor e insere tudo numa unica transacao.
-- SECURITY INVOKER: a RLS de cada tabela continua valendo para quem chama.
-- A skill (quando existe) e inserida ANTES da trilha, para que linked_skill_id
-- entre direto no INSERT de study_tracks e nenhum UPDATE toque a trilha depois.

CREATE OR REPLACE FUNCTION aplicar_intencao(p_intencao UUID, p_caminho TEXT, p_registros JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  r        JSONB;
  novo     UUID;
  feitos   JSONB := '[]'::jsonb;
  uid      UUID  := auth.uid();
  track    UUID;
  skill    UUID;
  skill_nova BOOLEAN := false;
  n_skills INT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'nao_autenticado';
  END IF;

  IF p_registros IS NULL OR jsonb_typeof(p_registros) <> 'array' THEN
    RAISE EXCEPTION 'registros_invalidos';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM intencoes
    WHERE id = p_intencao AND user_id = uid AND status = 'em_aberto'
  ) THEN
    RAISE EXCEPTION 'intencao_invalida';
  END IF;

  -- Passo 1: a skill primeiro (no maximo uma por intencao)
  SELECT count(*) INTO n_skills
  FROM jsonb_array_elements(p_registros) AS e(value)
  WHERE e.value->>'tabela' = 'skills';

  IF n_skills > 1 THEN
    RAISE EXCEPTION 'multiplas_skills';
  END IF;

  IF n_skills = 1 THEN
    SELECT e.value INTO r
    FROM jsonb_array_elements(p_registros) AS e(value)
    WHERE e.value->>'tabela' = 'skills'
    LIMIT 1;

    -- reaproveita a habilidade se o usuario ja tem uma com o mesmo nome
    -- (nesse caso ela nao entra no "aplicado" como criada, para o desfazer nao apaga-la)
    SELECT id INTO skill FROM skills
    WHERE user_id = uid AND lower(name) = lower(r->>'name')
    LIMIT 1;
    IF skill IS NULL THEN
      INSERT INTO skills (user_id, name, category)
      VALUES (uid, r->>'name', 'language')
      RETURNING id INTO skill;
      skill_nova := true;
    END IF;
  END IF;

  -- Passo 2: o resto, na ordem recebida (a skill entra na lista na posicao original)
  FOR r IN SELECT e.value FROM jsonb_array_elements(p_registros) AS e(value) LOOP
    CASE r->>'tabela'
      WHEN 'skills' THEN
        novo := skill;
        -- habilidade que ja existia: liga a trilha, mas nao entra no "aplicado"
        IF NOT skill_nova THEN
          CONTINUE;
        END IF;

      WHEN 'study_tracks' THEN
        INSERT INTO study_tracks (user_id, name, category, target_date, cost, linked_skill_id)
        VALUES (
          uid,
          r->>'name',
          'languages',
          (r->>'target_date')::date,
          (r->>'cost')::numeric,
          skill
        )
        RETURNING id INTO novo;
        track := novo;

      WHEN 'recurring_transactions' THEN
        INSERT INTO recurring_transactions (user_id, name, amount, type, frequency, day_of_month, start_date)
        VALUES (
          uid,
          r->>'name',
          (r->>'amount')::numeric,
          'expense',
          'monthly',
          (r->>'day_of_month')::int,
          COALESCE((r->>'start_date')::date, current_date)
        )
        RETURNING id INTO novo;

      WHEN 'agenda_events' THEN
        INSERT INTO agenda_events (user_id, title, date, start_time, end_time, type, recurrence)
        VALUES (
          uid,
          r->>'title',
          r->>'date',
          r->>'start_time',
          r->>'end_time',
          'estudo',
          'weekly'
        )
        RETURNING id INTO novo;

      WHEN 'goals' THEN
        INSERT INTO goals (user_id, name, goal_type, category, target_date)
        VALUES (
          uid,
          r->>'name',
          'habit',
          'aprendizado',
          (r->>'target_date')::date
        )
        RETURNING id INTO novo;

      ELSE
        RAISE EXCEPTION 'tabela_fora_da_whitelist: %', r->>'tabela';
    END CASE;

    feitos := feitos || jsonb_build_object(
      'tabela', r->>'tabela',
      'id',     novo,
      'rotulo', r->>'rotulo',
      'href',   r->>'href'
    );
  END LOOP;

  -- Passo 3: elo skill <-> trilha (tabela de ligacao, sem UPDATE em study_tracks)
  IF track IS NOT NULL AND skill IS NOT NULL THEN
    INSERT INTO skill_study_tracks (skill_id, track_id)
    VALUES (skill, track)
    ON CONFLICT DO NOTHING;
  END IF;

  UPDATE intencoes
  SET status = 'aplicada', caminho = p_caminho, aplicado = feitos, aplicada_em = now()
  WHERE id = p_intencao AND user_id = uid;

  RETURN feitos;
END
$$;

-- ─── 4. desfazer_intencao ──────────────────────────────────────────────────
-- Apaga so o que nao foi editado depois: updated_at = created_at.
-- As 5 tabelas tem as duas colunas (recurring_transactions, agenda_events e goals
-- via trigger; study_tracks e skills porque o app grava updated_at ao editar).
-- O que ficou (ja editado) volta na resposta para o app avisar.

CREATE OR REPLACE FUNCTION desfazer_intencao(p_intencao UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  r       JSONB;
  ficaram JSONB := '[]'::jsonb;
  uid     UUID  := auth.uid();
  n       INT;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'nao_autenticado';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM intencoes
    WHERE id = p_intencao AND user_id = uid AND status = 'aplicada'
  ) THEN
    RAISE EXCEPTION 'intencao_invalida';
  END IF;

  FOR r IN
    SELECT e.value
    FROM intencoes i, jsonb_array_elements(i.aplicado) AS e(value)
    WHERE i.id = p_intencao AND i.user_id = uid
  LOOP
    n := 0;

    CASE r->>'tabela'
      WHEN 'study_tracks' THEN
        DELETE FROM study_tracks
        WHERE id = (r->>'id')::uuid AND user_id = uid AND updated_at = created_at;
        GET DIAGNOSTICS n = ROW_COUNT;

      WHEN 'skills' THEN
        DELETE FROM skills
        WHERE id = (r->>'id')::uuid AND user_id = uid AND updated_at = created_at;
        GET DIAGNOSTICS n = ROW_COUNT;

      WHEN 'recurring_transactions' THEN
        DELETE FROM recurring_transactions
        WHERE id = (r->>'id')::uuid AND user_id = uid AND updated_at = created_at;
        GET DIAGNOSTICS n = ROW_COUNT;

      WHEN 'agenda_events' THEN
        DELETE FROM agenda_events
        WHERE id = (r->>'id')::uuid AND user_id = uid AND updated_at = created_at;
        GET DIAGNOSTICS n = ROW_COUNT;

      WHEN 'goals' THEN
        DELETE FROM goals
        WHERE id = (r->>'id')::uuid AND user_id = uid AND updated_at = created_at;
        GET DIAGNOSTICS n = ROW_COUNT;

      ELSE
        -- tabela desconhecida: nao apaga nada, fica na lista
        n := 0;
    END CASE;

    IF n = 0 THEN
      ficaram := ficaram || r;
    END IF;
  END LOOP;

  UPDATE intencoes
  SET status = 'desfeita', desfeita_em = now()
  WHERE id = p_intencao AND user_id = uid;

  RETURN ficaram;
END
$$;

-- ─── 5. Grants ─────────────────────────────────────────────────────────────

REVOKE ALL ON FUNCTION aplicar_intencao(UUID, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION desfazer_intencao(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION aplicar_intencao(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION desfazer_intencao(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION aplicar_intencao(UUID, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION desfazer_intencao(UUID) TO service_role;
