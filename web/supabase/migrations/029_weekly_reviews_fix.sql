-- 029_weekly_reviews_fix.sql : o fechamento semanal nunca persistiu.
-- Plano: docs/superpowers/plans/2026-10-04-fase1-implementacao-web.md (Task 5)
--
-- Causa: o app (dashboard/review/page.tsx) faz upsert de {user_id, week_start, completed_at, score_gained}
-- e a tabela criada em 013 exige week_end NOT NULL e nao tem score_gained.
-- Atencao: 013 e 016 criam weekly_reviews com shapes diferentes (CREATE TABLE IF NOT EXISTS,
-- so a primeira que rodou valeu). Esta migration garante as colunas que o app usa nos dois casos.

-- ─── 1. Colunas que o app grava ou vai gravar ──────────────────────────────

ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS week_end     DATE;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS data         JSONB NOT NULL DEFAULT '{}';
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS shared       BOOLEAN DEFAULT FALSE;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS score_gained INT NOT NULL DEFAULT 0;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS score_inicio INT;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS score_fim    INT;

-- data pode ter sido criada em 013 sem NOT NULL e sem default: normaliza
UPDATE weekly_reviews SET data = '{}'::jsonb WHERE data IS NULL;
ALTER TABLE weekly_reviews ALTER COLUMN data SET DEFAULT '{}'::jsonb;
ALTER TABLE weekly_reviews ALTER COLUMN data SET NOT NULL;

-- ─── 2. week_end deixa de ser obrigatorio e ganha default derivado ─────────
-- Um DEFAULT de coluna nao pode olhar week_start, entao o default vem por trigger:
-- week_end = week_start + 6 dias quando vier NULL.

ALTER TABLE weekly_reviews ALTER COLUMN week_end DROP NOT NULL;

UPDATE weekly_reviews SET week_end = week_start + 6 WHERE week_end IS NULL;

CREATE OR REPLACE FUNCTION weekly_reviews_fill_week_end()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.week_end IS NULL THEN
    NEW.week_end := NEW.week_start + 6;
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_weekly_reviews_fill_week_end ON weekly_reviews;
CREATE TRIGGER trg_weekly_reviews_fill_week_end
  BEFORE INSERT OR UPDATE ON weekly_reviews
  FOR EACH ROW EXECUTE FUNCTION weekly_reviews_fill_week_end();

-- ─── 3. RLS: garante as tres operacoes do upsert (select + insert + update) ─
-- 013 criou tres policies separadas e 016 uma FOR ALL; qualquer uma das duas
-- cobre o upsert. Aqui so garantimos que RLS esta ligada e que existe cobertura.

ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own weekly reviews" ON weekly_reviews;
CREATE POLICY "Users can manage own weekly reviews"
  ON weekly_reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
