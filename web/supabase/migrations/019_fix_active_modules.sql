-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 019 — Fix active_modules: renomeia nomes V2 → V3
--
-- Histórico: o campo active_modules em profiles armazenava nomes de módulos
-- da V2 ('saude', 'metas', 'agenda', 'estudos'). Na V3 esses módulos foram
-- renomeados para 'corpo', 'futuro', 'tempo' (e 'estudos' virou parte de 'mente').
-- O score engine tentava persistir colunas como 'saude_score', 'agenda_score'
-- que não existem em life_sync_scores, causando erro PGRST204.
--
-- Mapeamento:
--   saude   → corpo
--   metas   → futuro
--   agenda  → tempo
--   estudos → removido (sem equivalente direto em V3; coberto por 'mente')
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE profiles
SET active_modules = (
  SELECT jsonb_agg(novo_nome)
  FROM (
    SELECT
      CASE elem #>> '{}'
        WHEN 'saude'   THEN 'corpo'
        WHEN 'metas'   THEN 'futuro'
        WHEN 'agenda'  THEN 'tempo'
        WHEN 'estudos' THEN NULL   -- será filtrado pelo WHERE abaixo
        ELSE elem #>> '{}'
      END AS novo_nome
    FROM jsonb_array_elements(active_modules) AS elem
  ) AS mapped
  WHERE novo_nome IS NOT NULL
)
WHERE active_modules IS NOT NULL
  AND (
    active_modules @> '["saude"]'   OR
    active_modules @> '["metas"]'   OR
    active_modules @> '["agenda"]'  OR
    active_modules @> '["estudos"]'
  );
