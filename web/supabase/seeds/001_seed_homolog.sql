-- =============================================
-- SyncLife — Seed de Homologação
-- =============================================
-- Popula dados realistas para testar todas as telas da Fase 2.
--
-- PRÉ-REQUISITOS:
--   1. Execute a migration 002_fase2_financas.sql antes deste seed
--   2. Tenha pelo menos 1 usuário cadastrado (crie uma conta no app)
--
-- COMO RODAR:
--   Supabase Dashboard → SQL Editor → Cole este arquivo → Run (F5)
--
-- ATENÇÃO:
--   Este script APAGA os dados existentes do primeiro usuário
--   antes de inserir os dados de exemplo.
-- =============================================

DO $$
DECLARE
  uid UUID := (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1);

  -- ── IDs de categorias (income) ──────────────────────────────────────────
  cat_salario       UUID;
  cat_freelance     UUID;
  cat_invest_rend   UUID;
  cat_outros_rec    UUID;

  -- ── IDs de categorias (expense) ─────────────────────────────────────────
  cat_moradia       UUID;
  cat_supermercado  UUID;
  cat_alimentacao   UUID;
  cat_transporte    UUID;
  cat_saude         UUID;
  cat_lazer         UUID;
  cat_educacao      UUID;
  cat_contas        UUID;
  cat_vestuario     UUID;
  cat_pets          UUID;

  -- ── IDs de metas (Fase 3) ────────────────────────────────────────────────
  goal_viagem   UUID;
  goal_reserva  UUID;
  goal_curso    UUID;
  goal_carro    UUID;

  -- ── Referências de datas ─────────────────────────────────────────────────
  today  DATE := CURRENT_DATE;
  m0     DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;           -- início do mês atual
  m1     DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;  -- mês passado
  m2     DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE; -- 2 meses atrás
  m3     DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')::DATE; -- 3 meses atrás

BEGIN
  -- ── Validação ──────────────────────────────────────────────────────────
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário encontrado. Crie uma conta no app antes de rodar o seed.';
  END IF;

  RAISE NOTICE '→ Populando dados para usuário: %', uid;

  -- ── Limpeza (para re-rodar sem duplicar) ──────────────────────────────
  DELETE FROM planning_events       WHERE user_id = uid;
  DELETE FROM budgets               WHERE user_id = uid;
  DELETE FROM transactions          WHERE user_id = uid;
  DELETE FROM recurring_transactions WHERE user_id = uid;
  DELETE FROM categories            WHERE user_id = uid;

  -- ── 1. Perfil ──────────────────────────────────────────────────────────
  UPDATE profiles SET
    monthly_income       = 7300.00,
    current_balance      = 14850.00,
    savings_goal_pct     = 20,
    onboarding_completed = TRUE
  WHERE id = uid;

  -- ── 2. Categorias ──────────────────────────────────────────────────────

  -- Income
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Salário',           '💼', '#10b981', 'income', TRUE,  1) RETURNING id INTO cat_salario;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Freelance',         '💻', '#0055ff', 'income', TRUE,  2) RETURNING id INTO cat_freelance;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Rendimentos',       '📈', '#10b981', 'income', FALSE, 3) RETURNING id INTO cat_invest_rend;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Outras receitas',   '💰', '#f59e0b', 'income', FALSE, 4) RETURNING id INTO cat_outros_rec;

  -- Expense
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Moradia',           '🏠', '#f43f5e', 'expense', TRUE,  1) RETURNING id INTO cat_moradia;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Supermercado',      '🛒', '#f59e0b', 'expense', TRUE,  2) RETURNING id INTO cat_supermercado;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Alimentação',       '🍔', '#f97316', 'expense', TRUE,  3) RETURNING id INTO cat_alimentacao;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Transporte',        '🚗', '#f97316', 'expense', TRUE,  4) RETURNING id INTO cat_transporte;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Saúde',             '💊', '#06b6d4', 'expense', TRUE,  5) RETURNING id INTO cat_saude;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Lazer',             '🎭', '#a855f7', 'expense', TRUE,  6) RETURNING id INTO cat_lazer;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Educação',          '📚', '#a855f7', 'expense', FALSE, 7) RETURNING id INTO cat_educacao;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Contas e Serviços', '💡', '#6b7280', 'expense', TRUE,  8) RETURNING id INTO cat_contas;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Vestuário',         '👕', '#f97316', 'expense', FALSE, 9) RETURNING id INTO cat_vestuario;
  INSERT INTO categories (user_id, name, icon, color, type, is_default, sort_order)
    VALUES (uid, 'Pets',              '🐾', '#10b981', 'expense', FALSE, 10) RETURNING id INTO cat_pets;

  -- ── 3. Recorrentes ─────────────────────────────────────────────────────

  INSERT INTO recurring_transactions
    (user_id, category_id, name, amount, type, frequency, day_of_month, start_date, is_active, is_paused)
  VALUES
    -- Income
    (uid, cat_salario,    'Salário CLT',          6500.00, 'income',  'monthly',   5, m3, TRUE, FALSE),
    (uid, cat_invest_rend,'Rendimento CDB',         480.00, 'income',  'monthly',  28, m2, TRUE, FALSE),
    (uid, cat_freelance,  'Retainer Cliente A',     800.00, 'income',  'monthly',  25, m2, TRUE, FALSE),
    -- Expense — Moradia
    (uid, cat_moradia,    'Aluguel',              1800.00, 'expense', 'monthly',  10, m3, TRUE, FALSE),
    (uid, cat_contas,     'Internet Fibra',         119.90, 'expense', 'monthly',  12, m3, TRUE, FALSE),
    (uid, cat_contas,     'Plano de Saúde',         389.00, 'expense', 'monthly',   5, m3, TRUE, FALSE),
    (uid, cat_contas,     'Energia Elétrica',        95.00, 'expense', 'monthly',  15, m3, TRUE, FALSE),
    -- Expense — Serviços
    (uid, cat_lazer,      'Netflix',                 55.90, 'expense', 'monthly',  18, m3, TRUE, FALSE),
    (uid, cat_lazer,      'Spotify',                 21.90, 'expense', 'monthly',  18, m3, TRUE, FALSE),
    (uid, cat_lazer,      'Prime Video',             19.90, 'expense', 'monthly',  20, m3, TRUE, FALSE),
    (uid, cat_saude,      'Academia SmartFit',        99.90, 'expense', 'monthly',   1, m3, TRUE, FALSE),
    -- Expense — Pausado (exemplo de recorrente pausada)
    (uid, cat_educacao,   'Curso de Inglês',         189.00, 'expense', 'monthly',  10, m3, TRUE, TRUE);

  -- ── 4. Transações ──────────────────────────────────────────────────────

  -- ── Mês -3 ────────────────────────────────────────────────────────────
  INSERT INTO transactions (user_id, category_id, amount, type, description, date, payment_method, is_future)
  VALUES
    (uid, cat_salario,      6500.00, 'income',  'Salário CLT',                  m3 + 4,  'transfer', FALSE),
    (uid, cat_invest_rend,   480.00, 'income',  'Rendimento CDB',               m3 + 27, 'transfer', FALSE),
    (uid, cat_moradia,      1800.00, 'expense', 'Aluguel',                      m3 + 9,  'transfer', FALSE),
    (uid, cat_contas,        119.90, 'expense', 'Internet Fibra',               m3 + 11, 'debit',    FALSE),
    (uid, cat_contas,        389.00, 'expense', 'Plano de Saúde',               m3 + 4,  'debit',    FALSE),
    (uid, cat_contas,         88.50, 'expense', 'Energia Elétrica',             m3 + 14, 'boleto',   FALSE),
    (uid, cat_lazer,          55.90, 'expense', 'Netflix',                      m3 + 17, 'credit',   FALSE),
    (uid, cat_lazer,          21.90, 'expense', 'Spotify',                      m3 + 17, 'debit',    FALSE),
    (uid, cat_lazer,          19.90, 'expense', 'Prime Video',                  m3 + 19, 'debit',    FALSE),
    (uid, cat_saude,          99.90, 'expense', 'Academia SmartFit',            m3 + 0,  'debit',    FALSE),
    (uid, cat_supermercado,  680.00, 'expense', 'Supermercado Extra',           m3 + 5,  'debit',    FALSE),
    (uid, cat_supermercado,  390.00, 'expense', 'Feira livre',                  m3 + 18, 'cash',     FALSE),
    (uid, cat_alimentacao,   310.00, 'expense', 'Restaurantes',                 m3 + 12, 'credit',   FALSE),
    (uid, cat_alimentacao,   145.00, 'expense', 'Lanchonetes e café',           m3 + 22, 'pix',      FALSE),
    (uid, cat_transporte,    195.00, 'expense', 'Gasolina',                     m3 + 7,  'credit',   FALSE),
    (uid, cat_transporte,     72.00, 'expense', 'Uber',                         m3 + 20, 'credit',   FALSE),
    (uid, cat_saude,         245.00, 'expense', 'Consulta médica + exames',     m3 + 15, 'credit',   FALSE),
    (uid, cat_lazer,         180.00, 'expense', 'Cinema e bares',               m3 + 22, 'pix',      FALSE),
    (uid, cat_pets,          120.00, 'expense', 'Vet + ração',                  m3 + 10, 'pix',      FALSE);

  -- ── Mês -2 ────────────────────────────────────────────────────────────
  INSERT INTO transactions (user_id, category_id, amount, type, description, date, payment_method, is_future)
  VALUES
    (uid, cat_salario,      6500.00, 'income',  'Salário CLT',                  m2 + 4,  'transfer', FALSE),
    (uid, cat_freelance,    1200.00, 'income',  'Projeto app — Cliente B',      m2 + 20, 'pix',      FALSE),
    (uid, cat_invest_rend,   480.00, 'income',  'Rendimento CDB',               m2 + 27, 'transfer', FALSE),
    (uid, cat_freelance,     800.00, 'income',  'Retainer Cliente A',           m2 + 24, 'pix',      FALSE),
    (uid, cat_moradia,      1800.00, 'expense', 'Aluguel',                      m2 + 9,  'transfer', FALSE),
    (uid, cat_contas,        119.90, 'expense', 'Internet Fibra',               m2 + 11, 'debit',    FALSE),
    (uid, cat_contas,        389.00, 'expense', 'Plano de Saúde',               m2 + 4,  'debit',    FALSE),
    (uid, cat_contas,        102.40, 'expense', 'Energia Elétrica',             m2 + 14, 'boleto',   FALSE),
    (uid, cat_lazer,          55.90, 'expense', 'Netflix',                      m2 + 17, 'credit',   FALSE),
    (uid, cat_lazer,          21.90, 'expense', 'Spotify',                      m2 + 17, 'debit',    FALSE),
    (uid, cat_lazer,          19.90, 'expense', 'Prime Video',                  m2 + 19, 'debit',    FALSE),
    (uid, cat_saude,          99.90, 'expense', 'Academia SmartFit',            m2 + 0,  'debit',    FALSE),
    (uid, cat_supermercado,  720.00, 'expense', 'Supermercado Pão de Açúcar',   m2 + 3,  'debit',    FALSE),
    (uid, cat_supermercado,  380.00, 'expense', 'Feira + padaria',              m2 + 16, 'cash',     FALSE),
    (uid, cat_alimentacao,   420.00, 'expense', 'Restaurantes',                 m2 + 10, 'credit',   FALSE),
    (uid, cat_alimentacao,    98.00, 'expense', 'iFood',                        m2 + 21, 'pix',      FALSE),
    (uid, cat_transporte,    215.00, 'expense', 'Gasolina',                     m2 + 7,  'credit',   FALSE),
    (uid, cat_transporte,     45.00, 'expense', 'Estacionamento shopping',      m2 + 19, 'cash',     FALSE),
    (uid, cat_educacao,      290.00, 'expense', 'Curso online — React/Next',    m2 + 12, 'credit',   FALSE),
    (uid, cat_vestuario,     355.00, 'expense', 'Roupas outono',                m2 + 17, 'credit',   FALSE),
    (uid, cat_lazer,         265.00, 'expense', 'Saída com amigos',             m2 + 23, 'pix',      FALSE),
    (uid, cat_pets,           85.00, 'expense', 'Ração e petiscos',             m2 + 8,  'pix',      FALSE);

  -- ── Mês -1 ────────────────────────────────────────────────────────────
  INSERT INTO transactions (user_id, category_id, amount, type, description, date, payment_method, is_future)
  VALUES
    (uid, cat_salario,      6500.00, 'income',  'Salário CLT',                  m1 + 4,  'transfer', FALSE),
    (uid, cat_freelance,    1800.00, 'income',  'Projeto e-commerce — Cliente C',m1 + 22, 'pix',      FALSE),
    (uid, cat_invest_rend,   480.00, 'income',  'Rendimento CDB',               m1 + 27, 'transfer', FALSE),
    (uid, cat_freelance,     800.00, 'income',  'Retainer Cliente A',           m1 + 24, 'pix',      FALSE),
    (uid, cat_moradia,      1800.00, 'expense', 'Aluguel',                      m1 + 9,  'transfer', FALSE),
    (uid, cat_contas,        119.90, 'expense', 'Internet Fibra',               m1 + 11, 'debit',    FALSE),
    (uid, cat_contas,        389.00, 'expense', 'Plano de Saúde',               m1 + 4,  'debit',    FALSE),
    (uid, cat_contas,        115.80, 'expense', 'Energia Elétrica',             m1 + 14, 'boleto',   FALSE),
    (uid, cat_lazer,          55.90, 'expense', 'Netflix',                      m1 + 17, 'credit',   FALSE),
    (uid, cat_lazer,          21.90, 'expense', 'Spotify',                      m1 + 17, 'debit',    FALSE),
    (uid, cat_lazer,          19.90, 'expense', 'Prime Video',                  m1 + 19, 'debit',    FALSE),
    (uid, cat_saude,          99.90, 'expense', 'Academia SmartFit',            m1 + 0,  'debit',    FALSE),
    (uid, cat_supermercado,  760.00, 'expense', 'Supermercado Extra',           m1 + 2,  'debit',    FALSE),
    (uid, cat_supermercado,  345.00, 'expense', 'Atacadão',                     m1 + 13, 'debit',    FALSE),
    (uid, cat_alimentacao,   390.00, 'expense', 'Restaurantes',                 m1 + 8,  'credit',   FALSE),
    (uid, cat_alimentacao,   125.00, 'expense', 'iFood + Rappi',                m1 + 15, 'pix',      FALSE),
    (uid, cat_transporte,    235.00, 'expense', 'Gasolina',                     m1 + 6,  'credit',   FALSE),
    (uid, cat_transporte,     95.00, 'expense', 'Uber e 99',                    m1 + 21, 'credit',   FALSE),
    (uid, cat_saude,         185.00, 'expense', 'Farmácia',                     m1 + 18, 'pix',      FALSE),
    (uid, cat_lazer,         340.00, 'expense', 'Show + jantar comemorativo',   m1 + 25, 'credit',   FALSE),
    (uid, cat_pets,          155.00, 'expense', 'Vet — consulta anual',         m1 + 11, 'pix',      FALSE);

  -- ── Mês atual (parcial — dias que já passaram) ────────────────────────
  INSERT INTO transactions (user_id, category_id, amount, type, description, date, payment_method, is_future)
  VALUES
    (uid, cat_salario,      6500.00, 'income',  'Salário CLT',                  m0 + 4,  'transfer', FALSE),
    (uid, cat_moradia,      1800.00, 'expense', 'Aluguel',                      m0 + 9,  'transfer', FALSE),
    (uid, cat_contas,        119.90, 'expense', 'Internet Fibra',               m0 + 11, 'debit',    FALSE),
    (uid, cat_contas,        389.00, 'expense', 'Plano de Saúde',               m0 + 4,  'debit',    FALSE),
    (uid, cat_saude,          99.90, 'expense', 'Academia SmartFit',            m0 + 0,  'debit',    FALSE),
    (uid, cat_lazer,          55.90, 'expense', 'Netflix',                      m0 + 17, 'credit',   FALSE),
    (uid, cat_lazer,          21.90, 'expense', 'Spotify',                      m0 + 17, 'debit',    FALSE),
    (uid, cat_lazer,          19.90, 'expense', 'Prime Video',                  m0 + 19, 'debit',    FALSE),
    (uid, cat_supermercado,  540.00, 'expense', 'Supermercado Extra',           m0 + 3,  'debit',    FALSE),
    (uid, cat_alimentacao,   295.00, 'expense', 'Restaurantes',                 m0 + 6,  'credit',   FALSE),
    (uid, cat_transporte,    175.00, 'expense', 'Gasolina',                     m0 + 7,  'credit',   FALSE),
    -- Futuros do mês atual
    (uid, cat_invest_rend,   480.00, 'income',  'Rendimento CDB (previsto)',    m0 + 27, 'transfer', TRUE),
    (uid, cat_freelance,     800.00, 'income',  'Retainer Cliente A (previsto)',m0 + 24, 'pix',      TRUE),
    (uid, cat_supermercado,  400.00, 'expense', 'Supermercado (previsto)',      m0 + 24, 'debit',    TRUE),
    (uid, cat_alimentacao,   150.00, 'expense', 'Delivery fim de semana',       m0 + 22, 'pix',      TRUE),
    (uid, cat_lazer,         220.00, 'expense', 'Saída fim de semana',          m0 + 22, 'pix',      TRUE),
    (uid, cat_contas,        110.00, 'expense', 'Energia Elétrica (previsto)',  m0 + 14, 'boleto',   TRUE);

  -- Corrigir is_future com base na data real
  UPDATE transactions
  SET is_future = (date > today)
  WHERE user_id = uid;

  -- ── 5. Orçamentos (mês atual) ──────────────────────────────────────────
  INSERT INTO budgets (user_id, category_id, amount, month, year, alert_threshold, is_active)
  VALUES
    (uid, cat_supermercado, 1200.00, EXTRACT(MONTH FROM today)::INTEGER, EXTRACT(YEAR FROM today)::INTEGER, 80, TRUE),
    (uid, cat_alimentacao,   800.00, EXTRACT(MONTH FROM today)::INTEGER, EXTRACT(YEAR FROM today)::INTEGER, 80, TRUE),
    (uid, cat_transporte,    500.00, EXTRACT(MONTH FROM today)::INTEGER, EXTRACT(YEAR FROM today)::INTEGER, 80, TRUE),
    (uid, cat_lazer,         600.00, EXTRACT(MONTH FROM today)::INTEGER, EXTRACT(YEAR FROM today)::INTEGER, 85, TRUE),
    (uid, cat_saude,         500.00, EXTRACT(MONTH FROM today)::INTEGER, EXTRACT(YEAR FROM today)::INTEGER, 75, TRUE),
    (uid, cat_educacao,      400.00, EXTRACT(MONTH FROM today)::INTEGER, EXTRACT(YEAR FROM today)::INTEGER, 90, TRUE),
    (uid, cat_contas,        800.00, EXTRACT(MONTH FROM today)::INTEGER, EXTRACT(YEAR FROM today)::INTEGER, 90, TRUE);

  -- Orçamentos do mês anterior (para comparativos)
  INSERT INTO budgets (user_id, category_id, amount, month, year, alert_threshold, is_active)
  VALUES
    (uid, cat_supermercado, 1100.00, EXTRACT(MONTH FROM m1)::INTEGER, EXTRACT(YEAR FROM m1)::INTEGER, 80, TRUE),
    (uid, cat_alimentacao,   700.00, EXTRACT(MONTH FROM m1)::INTEGER, EXTRACT(YEAR FROM m1)::INTEGER, 80, TRUE),
    (uid, cat_transporte,    450.00, EXTRACT(MONTH FROM m1)::INTEGER, EXTRACT(YEAR FROM m1)::INTEGER, 80, TRUE),
    (uid, cat_lazer,         500.00, EXTRACT(MONTH FROM m1)::INTEGER, EXTRACT(YEAR FROM m1)::INTEGER, 85, TRUE);

  -- ── 6. Planejamento Futuro ─────────────────────────────────────────────
  INSERT INTO planning_events (user_id, category_id, name, amount, type, planned_date, is_confirmed, notes)
  VALUES
    (uid, cat_lazer,     'Viagem de férias — Florianópolis', 4800.00, 'expense',
       today + 90,  FALSE, 'Passagens + hospedagem 7 dias'),
    (uid, cat_educacao,  'Especialização em Product Design',  2400.00, 'expense',
       today + 60,  FALSE, 'Parcelado em 12x, primeiro pagamento'),
    (uid, cat_freelance, 'Bônus projeto grande — Cliente D',  5000.00, 'income',
       today + 45,  FALSE, 'Entrega do projeto confirmada'),
    (uid, cat_moradia,   'Fundo de reserva — meta anual',     3000.00, 'expense',
       today + 150, FALSE, 'Aporte extra para reserva de emergência'),
    (uid, cat_vestuario, 'Roupas de verão',                    600.00, 'expense',
       today + 120, FALSE, NULL),
    (uid, cat_outros_rec,'Décimo terceiro salário',            6500.00, 'income',
       today + 300, FALSE, 'Estimativa baseada no salário atual'),
    (uid, cat_saude,     'Check-up anual',                      450.00, 'expense',
       today + 30,  FALSE, 'Exames de rotina + consultas');

  -- ============================================================
  -- FASE 3: Metas
  -- ============================================================

  -- Limpa dados antigos de metas
  DELETE FROM public.goal_milestones WHERE user_id = uid;
  DELETE FROM public.goal_contributions WHERE user_id = uid;
  DELETE FROM public.goals WHERE user_id = uid;

  -- ── Metas ──────────────────────────────────────────────────
  INSERT INTO public.goals (user_id, name, description, icon, category, goal_type,
    target_amount, current_amount, monthly_contribution, target_date, start_date, status, notes)
  VALUES (uid, 'Viagem Europa', 'Mochilão de 30 dias pela Europa em julho',
     '✈️', 'viagem', 'monetary', 15000.00, 7800.00, 1200.00, today + 150, today - 180, 'active', 'Passagens + hospedagem + passeios')
  RETURNING id INTO goal_viagem;

  INSERT INTO public.goals (user_id, name, description, icon, category, goal_type,
    target_amount, current_amount, monthly_contribution, target_date, start_date, status, notes)
  VALUES (uid, 'Reserva de Emergência', 'Fundo equivalente a 6 meses de despesas',
     '🛡️', 'reserva', 'monetary', 36000.00, 22500.00, 2000.00, today + 360, today - 365, 'active', 'Meta prioritária')
  RETURNING id INTO goal_reserva;

  INSERT INTO public.goals (user_id, name, description, icon, category, goal_type,
    target_amount, current_amount, monthly_contribution, target_date, start_date, status, completed_at, notes)
  VALUES (uid, 'Curso de Dados', 'MBA em Data Science + certificacoes AWS',
     '📚', 'educacao', 'monetary', 8000.00, 8000.00, 0.00, today - 10, today - 270, 'completed', today - 10, 'Curso concluido!')
  RETURNING id INTO goal_curso;

  INSERT INTO public.goals (user_id, name, description, icon, category, goal_type,
    target_amount, current_amount, monthly_contribution, target_date, start_date, status, notes)
  VALUES (uid, 'Carro Novo', 'Troca do carro atual por um SUV',
     '🚗', 'veiculo', 'monetary', 80000.00, 12000.00, 3000.00, today + 730, today - 60, 'active', 'Entrada + financiamento planejado')
  RETURNING id INTO goal_carro;

  -- ── Contribuições ──────────────────────────────────────────
  INSERT INTO public.goal_contributions (goal_id, user_id, amount, date, notes) VALUES
    (goal_viagem, uid, 1200.00, today - 150, 'Aporte mensal'),
    (goal_viagem, uid, 1200.00, today - 120, 'Aporte mensal'),
    (goal_viagem, uid, 1500.00, today - 90,  'Aporte extra — 13o salario'),
    (goal_viagem, uid, 1200.00, today - 60,  'Aporte mensal'),
    (goal_viagem, uid, 1200.00, today - 30,  'Aporte mensal'),
    (goal_viagem, uid, 1500.00, today - 5,   'Aporte mensal + extra'),
    (goal_reserva, uid, 2000.00, today - 330, 'Aporte mensal'),
    (goal_reserva, uid, 2000.00, today - 300, 'Aporte mensal'),
    (goal_reserva, uid, 2500.00, today - 270, 'Aporte extra'),
    (goal_reserva, uid, 2000.00, today - 240, 'Aporte mensal'),
    (goal_reserva, uid, 2000.00, today - 210, 'Aporte mensal'),
    (goal_reserva, uid, 2000.00, today - 180, 'Aporte mensal'),
    (goal_reserva, uid, 2000.00, today - 150, 'Aporte mensal'),
    (goal_reserva, uid, 2000.00, today - 120, 'Aporte mensal'),
    (goal_reserva, uid, 2000.00, today - 90,  'Aporte mensal'),
    (goal_reserva, uid, 2000.00, today - 60,  'Aporte mensal'),
    (goal_reserva, uid, 2000.00, today - 30,  'Aporte mensal'),
    (goal_curso, uid, 4000.00, today - 240, 'Primeira parcela'),
    (goal_curso, uid, 4000.00, today - 120, 'Segunda parcela — quitacao'),
    (goal_carro, uid, 5000.00, today - 50, 'Aporte inicial — poupanca anterior'),
    (goal_carro, uid, 3000.00, today - 20, 'Aporte mensal'),
    (goal_carro, uid, 4000.00, today - 5,  'Aporte extra — bonus');

  -- ── Milestones ─────────────────────────────────────────────
  INSERT INTO public.goal_milestones (goal_id, user_id, name, target_pct, reached_at) VALUES
    (goal_viagem, uid, 'Primeiro quarto', 25, today - 90),
    (goal_viagem, uid, 'Metade do caminho', 50, today - 10),
    (goal_viagem, uid, 'Quase la!', 75, NULL),
    (goal_viagem, uid, 'Meta concluida!', 100, NULL),
    (goal_reserva, uid, 'Primeiro quarto', 25, today - 300),
    (goal_reserva, uid, 'Metade do caminho', 50, today - 150),
    (goal_reserva, uid, 'Quase la!', 75, NULL),
    (goal_reserva, uid, 'Reserva completa!', 100, NULL),
    (goal_curso, uid, 'Primeiro quarto', 25, today - 240),
    (goal_curso, uid, 'Metade do caminho', 50, today - 200),
    (goal_curso, uid, 'Quase la!', 75, today - 150),
    (goal_curso, uid, 'Formado!', 100, today - 10),
    (goal_carro, uid, 'Primeiro quarto', 25, NULL),
    (goal_carro, uid, 'Metade do caminho', 50, NULL),
    (goal_carro, uid, 'Quase la!', 75, NULL),
    (goal_carro, uid, 'Carro novo!', 100, NULL);

  RAISE NOTICE '✅ Seed de homologação concluído com sucesso!';
  RAISE NOTICE '   Usuário: %', uid;
  RAISE NOTICE '   Categorias:    14 criadas';
  RAISE NOTICE '   Recorrentes:   13 criadas (1 pausada)';
  RAISE NOTICE '   Transações:    ~65 criadas (3 meses + mês atual)';
  RAISE NOTICE '   Orçamentos:    11 criados (mês atual + anterior)';
  RAISE NOTICE '   Planejamento:  7 eventos futuros';
  RAISE NOTICE '   Metas:         4 criadas (3 ativas, 1 concluída) + contribuições + milestones';

END;
$$;
