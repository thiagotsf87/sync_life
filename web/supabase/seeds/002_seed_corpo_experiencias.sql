-- =============================================
-- SyncLife — Seed Corpo + Experiencias
-- =============================================
-- Popula dados realistas para validar o redesign desktop
-- dos modulos Corpo (6 telas) e Experiencias (6 telas).
--
-- PRE-REQUISITOS:
--   1. Execute todas as migrations ate 015
--   2. Tenha pelo menos 1 usuario cadastrado
--   3. (Opcional) Rode 001_seed_homolog.sql antes
--
-- COMO RODAR:
--   Supabase Dashboard > SQL Editor > Cole este arquivo > Run (F5)
--
-- ATENCAO:
--   Este script APAGA dados de Corpo e Experiencias do primeiro
--   usuario antes de inserir os dados de exemplo.
-- =============================================

DO $$
DECLARE
  uid UUID := (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1);

  -- Datas de referencia
  today  DATE := CURRENT_DATE;
  m0     DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  m1     DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE;
  m2     DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')::DATE;
  m3     DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')::DATE;

  -- IDs de viagens
  trip_europa      UUID;
  trip_chile       UUID;
  trip_nordeste    UUID;
  trip_japao       UUID;
  trip_sp          UUID;

BEGIN
  -- Validacao
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuario encontrado. Crie uma conta no app antes de rodar o seed.';
  END IF;

  RAISE NOTICE '> Populando Corpo + Experiencias para usuario: %', uid;

  -- ============================================================
  -- LIMPEZA
  -- ============================================================
  DELETE FROM daily_water_intake    WHERE user_id = uid;
  DELETE FROM meals                 WHERE user_id = uid;
  DELETE FROM daily_steps           WHERE user_id = uid;
  DELETE FROM activities            WHERE user_id = uid;
  DELETE FROM medical_appointments  WHERE user_id = uid;
  DELETE FROM weight_entries        WHERE user_id = uid;

  -- Experiencias (cascade cuida dos sub-registros)
  DELETE FROM trip_memories         WHERE user_id = uid;
  DELETE FROM bucket_list_items     WHERE user_id = uid;
  DELETE FROM passport_badges       WHERE user_id = uid;
  DELETE FROM trips                 WHERE user_id = uid;

  -- ============================================================
  -- CORPO — 1. HEALTH PROFILE
  -- ============================================================
  INSERT INTO health_profiles (
    user_id, height_cm, current_weight, biological_sex, birth_date,
    activity_level, weight_goal_type, weight_goal_kg,
    daily_steps_goal, weekly_activity_goal, min_activity_minutes,
    daily_water_goal_ml, bmr, tdee, dietary_restrictions
  ) VALUES (
    uid, 180.0, 78.2, 'male', '1994-06-15',
    'moderate', 'lose', 75.0,
    10000, 5, 30,
    2500, 1812.0, 2356.0,
    ARRAY['lactose']
  )
  ON CONFLICT (user_id) DO UPDATE SET
    height_cm = EXCLUDED.height_cm,
    current_weight = EXCLUDED.current_weight,
    biological_sex = EXCLUDED.biological_sex,
    birth_date = EXCLUDED.birth_date,
    activity_level = EXCLUDED.activity_level,
    weight_goal_type = EXCLUDED.weight_goal_type,
    weight_goal_kg = EXCLUDED.weight_goal_kg,
    daily_steps_goal = EXCLUDED.daily_steps_goal,
    weekly_activity_goal = EXCLUDED.weekly_activity_goal,
    min_activity_minutes = EXCLUDED.min_activity_minutes,
    daily_water_goal_ml = EXCLUDED.daily_water_goal_ml,
    bmr = EXCLUDED.bmr,
    tdee = EXCLUDED.tdee,
    dietary_restrictions = EXCLUDED.dietary_restrictions,
    updated_at = NOW();

  -- ============================================================
  -- CORPO — 2. WEIGHT ENTRIES (90 dias, ~3 meses)
  -- ============================================================
  INSERT INTO weight_entries (user_id, weight, waist_cm, hip_cm, recorded_at, notes) VALUES
    -- 3 meses atras (inicio: 85kg)
    (uid, 85.0, 95.0, 102.0, today - 90, 'Inicio do programa'),
    (uid, 84.5, 94.5, 101.8, today - 83, NULL),
    (uid, 84.2, 94.2, 101.5, today - 76, NULL),
    (uid, 83.8, 93.8, 101.2, today - 69, 'Dieta ajustada'),
    (uid, 83.3, 93.3, 100.8, today - 62, NULL),
    (uid, 82.7, 92.8, 100.4, today - 55, NULL),
    (uid, 82.1, 92.2, 100.0, today - 48, 'Treinos intensificados'),
    (uid, 81.5, 91.5, 99.5, today - 41, NULL),
    (uid, 80.9, 91.0, 99.0, today - 34, NULL),
    (uid, 80.3, 90.5, 98.5, today - 27, 'Resultado consistente'),
    (uid, 79.8, 90.0, 98.2, today - 20, NULL),
    (uid, 79.3, 89.5, 97.8, today - 13, NULL),
    (uid, 78.7, 89.0, 97.5, today - 6,  'Quase na meta!'),
    (uid, 78.2, 88.5, 97.2, today - 1,  'Pesagem mais recente');

  -- ============================================================
  -- CORPO — 3. ACTIVITIES (ultimos 30 dias)
  -- ============================================================
  INSERT INTO activities (user_id, type, duration_minutes, distance_km, steps, intensity, calories_burned, met_value, recorded_at, notes) VALUES
    -- Semana atual (streak de 5 dias)
    (uid, 'running',     45, 6.2,  NULL, 4, 520.0, 9.8,  today - 0 + TIME '07:00', 'Corrida matinal parque'),
    (uid, 'weight_training', 55, NULL, NULL, 4, 380.0, 6.0, today - 1 + TIME '18:00', 'Treino A — peito/triceps'),
    (uid, 'cycling',     40, 12.5, NULL, 3, 340.0, 7.5,  today - 2 + TIME '06:30', 'Pedal leve'),
    (uid, 'weight_training', 50, NULL, NULL, 5, 420.0, 6.0, today - 3 + TIME '18:30', 'Treino B — costas/biceps'),
    (uid, 'running',     35, 5.0,  NULL, 3, 410.0, 9.8,  today - 4 + TIME '07:15', 'Corrida intervalo'),
    -- Semana passada
    (uid, 'swimming',    60, 2.0,  NULL, 3, 480.0, 8.0,  today - 7 + TIME '06:00', 'Natacao 40 piscinas'),
    (uid, 'weight_training', 50, NULL, NULL, 4, 370.0, 6.0, today - 8 + TIME '18:00', 'Treino C — pernas'),
    (uid, 'running',     50, 7.5,  NULL, 4, 580.0, 9.8,  today - 9 + TIME '07:00', 'Corrida longa'),
    (uid, 'yoga',        40, NULL, NULL, 2, 150.0, 3.0,  today - 10 + TIME '08:00', 'Yoga restaurativa'),
    (uid, 'weight_training', 55, NULL, NULL, 5, 410.0, 6.0, today - 11 + TIME '18:30', 'Treino A — pesado'),
    -- 2 semanas atras
    (uid, 'running',     40, 5.8,  NULL, 3, 470.0, 9.8,  today - 14 + TIME '07:00', NULL),
    (uid, 'weight_training', 45, NULL, NULL, 3, 320.0, 6.0, today - 15 + TIME '18:00', 'Treino B'),
    (uid, 'cycling',     90, 28.0, NULL, 4, 720.0, 7.5,  today - 16 + TIME '06:00', 'Pedal serra'),
    (uid, 'walking',     60, 5.0,  8200, 2, 250.0, 3.5,  today - 17 + TIME '17:00', 'Caminhada parque'),
    -- 3 semanas atras
    (uid, 'running',     30, 4.2,  NULL, 3, 350.0, 9.8,  today - 21 + TIME '07:00', NULL),
    (uid, 'weight_training', 50, NULL, NULL, 4, 380.0, 6.0, today - 22 + TIME '18:00', 'Treino C'),
    (uid, 'swimming',    45, 1.5,  NULL, 3, 360.0, 8.0,  today - 23 + TIME '06:30', 'Natacao tecnica'),
    -- 4 semanas atras
    (uid, 'running',     35, 5.0,  NULL, 3, 410.0, 9.8,  today - 28 + TIME '07:00', NULL),
    (uid, 'weight_training', 50, NULL, NULL, 4, 370.0, 6.0, today - 29 + TIME '18:00', 'Treino A'),
    (uid, 'cycling',     50, 15.0, NULL, 3, 400.0, 7.5,  today - 30 + TIME '06:30', 'Pedal leve');

  -- ============================================================
  -- CORPO — 4. DAILY STEPS (ultima semana)
  -- ============================================================
  INSERT INTO daily_steps (user_id, recorded_date, steps) VALUES
    (uid, today,     9850),
    (uid, today - 1, 11200),
    (uid, today - 2, 8400),
    (uid, today - 3, 12500),
    (uid, today - 4, 10300),
    (uid, today - 5, 6800),
    (uid, today - 6, 7200);

  -- ============================================================
  -- CORPO — 5. MEDICAL APPOINTMENTS
  -- ============================================================
  INSERT INTO medical_appointments (user_id, specialty, doctor_name, location, appointment_date, cost, status, notes) VALUES
    -- Proximas
    (uid, 'Cardiologista',   'Dr. Ricardo Mendes',   'Hospital Sirio-Libanes',     today + 5  + TIME '09:00', 450.00, 'scheduled', 'Check-up anual cardiaco'),
    (uid, 'Dermatologista',  'Dra. Ana Beatriz',     'Clinica DermaCare',           today + 18 + TIME '14:30', 320.00, 'scheduled', 'Avaliacao de manchas'),
    (uid, 'Oftalmologista',  'Dr. Paulo Henrique',   'Instituto da Visao',          today + 32 + TIME '10:00', 280.00, 'scheduled', 'Exame de vista anual'),
    -- Realizadas
    (uid, 'Clinico Geral',   'Dra. Maria Silva',     'UBS Central',                 today - 15 + TIME '08:00', 0.00,   'completed', 'Exames de rotina — tudo OK'),
    (uid, 'Ortopedista',     'Dr. Fernando Costa',   'Clinica OrtoSaude',           today - 30 + TIME '11:00', 380.00, 'completed', 'Avaliacao joelho — indicou fisio'),
    (uid, 'Nutricionista',   'Dra. Julia Ramos',     'Espaco Nutri+',               today - 45 + TIME '15:00', 250.00, 'completed', 'Ajuste no plano alimentar'),
    (uid, 'Dentista',        'Dr. Carlos Eduardo',   'OdontoClinic Premium',        today - 60 + TIME '09:30', 190.00, 'completed', 'Limpeza semestral'),
    -- Cancelada
    (uid, 'Endocrinologista','Dra. Patricia Lopes',   'Hospital Albert Einstein',   today - 10 + TIME '16:00', 520.00, 'cancelled', 'Reagendada para proximo mes');

  -- ============================================================
  -- CORPO — 6. MEALS (3 dias)
  -- ============================================================
  INSERT INTO meals (user_id, meal_slot, description, calories_kcal, protein_g, carbs_g, fat_g, meal_time, recorded_at, notes) VALUES
    -- Hoje
    (uid, 'breakfast', 'Ovos mexidos com torradas integrais + cafe', 380, 22.0, 35.0, 16.0, '07:30', today, NULL),
    (uid, 'lunch',     'Frango grelhado + arroz integral + salada + feijao', 650, 45.0, 62.0, 18.0, '12:30', today, 'Restaurante corporativo'),
    (uid, 'snack',     'Banana + pasta de amendoim + whey', 320, 28.0, 30.0, 12.0, '16:00', today, NULL),
    (uid, 'dinner',    'Salmao grelhado + batata doce + brocolis', 520, 38.0, 40.0, 20.0, '20:00', today, NULL),
    -- Ontem
    (uid, 'breakfast', 'Acai com granola e banana', 450, 8.0, 65.0, 18.0, '08:00', today - 1, NULL),
    (uid, 'lunch',     'File mignon + pure de batata + salada caesar', 720, 48.0, 55.0, 28.0, '13:00', today - 1, NULL),
    (uid, 'snack',     'Mix de castanhas + iogurte natural', 280, 14.0, 18.0, 18.0, '16:30', today - 1, NULL),
    (uid, 'dinner',    'Omelete de claras com legumes + pao integral', 380, 32.0, 25.0, 14.0, '19:30', today - 1, NULL),
    -- Anteontem
    (uid, 'breakfast', 'Tapioca com queijo e presunto + suco', 350, 18.0, 42.0, 12.0, '07:00', today - 2, NULL),
    (uid, 'lunch',     'Marmita — arroz + feijao + carne moida + salada', 580, 35.0, 58.0, 20.0, '12:00', today - 2, NULL),
    (uid, 'snack',     'Smoothie de morango com proteina', 250, 25.0, 22.0, 8.0,  '15:30', today - 2, NULL),
    (uid, 'dinner',    'Wrap integral de frango com salada', 420, 30.0, 38.0, 16.0, '19:00', today - 2, NULL);

  -- ============================================================
  -- CORPO — 7. DAILY WATER INTAKE (7 dias)
  -- ============================================================
  INSERT INTO daily_water_intake (user_id, recorded_date, intake_ml, goal_ml) VALUES
    (uid, today,     1750, 2500),
    (uid, today - 1, 2300, 2500),
    (uid, today - 2, 2500, 2500),
    (uid, today - 3, 1900, 2500),
    (uid, today - 4, 2100, 2500),
    (uid, today - 5, 2750, 2500),
    (uid, today - 6, 2000, 2500);


  -- ============================================================
  -- EXPERIENCIAS — 1. TRIPS
  -- ============================================================

  -- Trip 1: Concluida (Portugal + Espanha)
  INSERT INTO trips (
    user_id, name, destinations, trip_type, start_date, end_date,
    travelers_count, total_budget, total_spent, currency, status, notes
  ) VALUES (
    uid, 'Eurotrip Portugal & Espanha',
    ARRAY['Lisboa, Portugal', 'Porto, Portugal', 'Barcelona, Espanha', 'Madrid, Espanha'],
    'leisure', today - 120, today - 105,
    2, 18000.00, 16850.00, 'BRL', 'completed',
    'Viagem de aniversario — roteiro perfeito!'
  ) RETURNING id INTO trip_europa;

  -- Trip 2: Concluida (Chile)
  INSERT INTO trips (
    user_id, name, destinations, trip_type, start_date, end_date,
    travelers_count, total_budget, total_spent, currency, status, notes
  ) VALUES (
    uid, 'Santiago & Atacama',
    ARRAY['Santiago, Chile', 'San Pedro de Atacama, Chile'],
    'leisure', today - 240, today - 230,
    2, 12000.00, 11200.00, 'BRL', 'completed',
    'Deserto e vinhedos incriveis'
  ) RETURNING id INTO trip_chile;

  -- Trip 3: Em planejamento (Japao)
  INSERT INTO trips (
    user_id, name, destinations, trip_type, start_date, end_date,
    travelers_count, total_budget, total_spent, currency, status, notes
  ) VALUES (
    uid, 'Japao: Tokyo a Kyoto',
    ARRAY['Tokyo, Japao', 'Osaka, Japao', 'Kyoto, Japao'],
    'leisure', today + 90, today + 104,
    2, 35000.00, 8500.00, 'BRL', 'planning',
    'Sonho de muito tempo — cherry blossom season'
  ) RETURNING id INTO trip_japao;

  -- Trip 4: Reservada (Nordeste BR)
  INSERT INTO trips (
    user_id, name, destinations, trip_type, start_date, end_date,
    travelers_count, total_budget, total_spent, currency, status, notes
  ) VALUES (
    uid, 'Nordeste: Jericoacoara e Lencois',
    ARRAY['Jericoacoara, Brasil', 'Barreirinhas, Brasil'],
    'leisure', today + 30, today + 37,
    4, 9500.00, 4200.00, 'BRL', 'reserved',
    'Familia reunida — passagens ja compradas'
  ) RETURNING id INTO trip_nordeste;

  -- Trip 5: Trabalho (Sao Paulo)
  INSERT INTO trips (
    user_id, name, destinations, trip_type, start_date, end_date,
    travelers_count, total_budget, total_spent, currency, status, notes
  ) VALUES (
    uid, 'Conferencia Tech SP',
    ARRAY['Sao Paulo, Brasil'],
    'work', today + 15, today + 17,
    1, 2500.00, 1200.00, 'BRL', 'reserved',
    'Palestra + networking — empresa patrocina parte'
  ) RETURNING id INTO trip_sp;

  -- ============================================================
  -- EXPERIENCIAS — 2. ACCOMMODATIONS
  -- ============================================================
  INSERT INTO trip_accommodations (trip_id, name, address, check_in, check_out, cost_per_night, total_cost, currency, booking_status, confirmation_code, notes) VALUES
    -- Europa
    (trip_europa, 'Hotel Pessoa Lisboa',      'Rua Augusta 120, Lisboa',    today - 120, today - 116, 280.00, 1120.00, 'BRL', 'paid',      'LIS-8842', 'Vista para o Tejo'),
    (trip_europa, 'Casa do Porto B&B',        'Rua das Flores 45, Porto',   today - 116, today - 113, 220.00, 660.00,  'BRL', 'paid',      'OPO-3371', 'Perto da Ribeira'),
    (trip_europa, 'Hotel Arts Barcelona',     'Passeig Maritim 19, BCN',    today - 113, today - 109, 350.00, 1400.00, 'BRL', 'paid',      'BCN-5519', 'Vista para o mar'),
    (trip_europa, 'NH Madrid Centro',         'Gran Via 21, Madrid',         today - 109, today - 105, 300.00, 1200.00, 'BRL', 'paid',      'MAD-7783', NULL),
    -- Chile
    (trip_chile, 'Hotel Cumbres Lastarria',   'Jose V. Lastarria 299',      today - 240, today - 236, 250.00, 1000.00, 'BRL', 'paid',      'SCL-2291', 'Barrio Lastarria'),
    (trip_chile, 'Hostal Atacama Desert',     'Tocopilla 411, San Pedro',    today - 236, today - 230, 180.00, 1080.00, 'BRL', 'paid',      'ATA-4456', 'Com cafe da manha'),
    -- Japao (planejamento)
    (trip_japao, 'Shinjuku Granbell Hotel',   'Kabukicho, Shinjuku',         today + 90,  today + 96,  400.00, 2400.00, 'BRL', 'estimated', NULL,        'Proximo a estacao'),
    (trip_japao, 'Osaka Cross Hotel',         'Shinsaibashi, Osaka',         today + 96,  today + 100, 350.00, 1400.00, 'BRL', 'estimated', NULL,        'Area comercial'),
    (trip_japao, 'Kyoto Machiya Ryokan',      'Higashiyama-ku, Kyoto',       today + 100, today + 104, 500.00, 2000.00, 'BRL', 'estimated', NULL,        'Ryokan tradicional'),
    -- Nordeste
    (trip_nordeste, 'Pousada Vila Kalango',   'Rua Principal, Jericoacoara', today + 30,  today + 34,  380.00, 1520.00, 'BRL', 'reserved',  'JER-1198', 'Pe na areia'),
    (trip_nordeste, 'Pousada Encantes',       'Av. Beira Rio, Barreirinhas', today + 34,  today + 37,  250.00, 750.00,  'BRL', 'reserved',  'LEN-6632', 'Saida para os Lencois'),
    -- SP
    (trip_sp, 'Ibis Paulista',                'Av. Paulista 2355',           today + 15,  today + 17,  220.00, 440.00,  'BRL', 'reserved',  'GRU-9901', 'Proximo ao evento');

  -- ============================================================
  -- EXPERIENCIAS — 3. TRANSPORTS
  -- ============================================================
  INSERT INTO trip_transports (trip_id, type, origin, destination, departure_datetime, arrival_datetime, company, cost, currency, booking_status, confirmation_code) VALUES
    -- Europa
    (trip_europa, 'flight',  'GRU - Guarulhos',     'LIS - Lisboa',      (today - 120)::timestamp + TIME '22:30', (today - 119)::timestamp + TIME '10:15', 'TAP Portugal',  3200.00, 'BRL', 'paid', 'TAP-BR4421'),
    (trip_europa, 'train',   'Lisboa Santa Apolonia','Porto Campanha',    (today - 116)::timestamp + TIME '08:30', (today - 116)::timestamp + TIME '11:15', 'CP Portugal',    120.00, 'BRL', 'paid', NULL),
    (trip_europa, 'flight',  'OPO - Porto',          'BCN - Barcelona',   (today - 113)::timestamp + TIME '12:00', (today - 113)::timestamp + TIME '15:30', 'Ryanair',         280.00, 'BRL', 'paid', 'FR-8832'),
    (trip_europa, 'train',   'Barcelona Sants',      'Madrid Atocha',     (today - 109)::timestamp + TIME '09:00', (today - 109)::timestamp + TIME '11:40', 'Renfe AVE',       180.00, 'BRL', 'paid', NULL),
    (trip_europa, 'flight',  'MAD - Madrid',         'GRU - Guarulhos',   (today - 105)::timestamp + TIME '23:00', (today - 104)::timestamp + TIME '06:30', 'LATAM',          2800.00, 'BRL', 'paid', 'LA-8210'),
    -- Chile
    (trip_chile, 'flight', 'GRU - Guarulhos',        'SCL - Santiago',    (today - 240)::timestamp + TIME '08:00', (today - 240)::timestamp + TIME '13:30', 'LATAM',          1800.00, 'BRL', 'paid', 'LA-3301'),
    (trip_chile, 'flight', 'SCL - Santiago',          'CJC - Calama',     (today - 236)::timestamp + TIME '07:00', (today - 236)::timestamp + TIME '09:15', 'Sky Airline',     350.00, 'BRL', 'paid', 'SKY-112'),
    (trip_chile, 'flight', 'CJC - Calama',            'SCL - Santiago',   (today - 231)::timestamp + TIME '17:00', (today - 231)::timestamp + TIME '19:15', 'Sky Airline',     350.00, 'BRL', 'paid', 'SKY-225'),
    (trip_chile, 'flight', 'SCL - Santiago',          'GRU - Guarulhos',  (today - 230)::timestamp + TIME '14:00', (today - 230)::timestamp + TIME '19:30', 'LATAM',          1800.00, 'BRL', 'paid', 'LA-3415'),
    -- Japao (planejamento)
    (trip_japao, 'flight', 'GRU - Guarulhos',        'NRT - Narita',     (today + 90)::timestamp + TIME '23:00',  (today + 92)::timestamp + TIME '06:30',  'ANA',            6500.00, 'BRL', 'estimated', NULL),
    (trip_japao, 'train',  'Tokyo Station',           'Shin-Osaka',       (today + 96)::timestamp + TIME '10:00',  (today + 96)::timestamp + TIME '12:30',  'JR Shinkansen',   800.00, 'BRL', 'estimated', NULL),
    (trip_japao, 'train',  'Shin-Osaka',              'Kyoto Station',    (today + 100)::timestamp + TIME '09:00', (today + 100)::timestamp + TIME '09:30', 'JR Local',         50.00, 'BRL', 'estimated', NULL),
    (trip_japao, 'flight', 'KIX - Kansai',           'GRU - Guarulhos',  (today + 104)::timestamp + TIME '11:00', (today + 105)::timestamp + TIME '18:00', 'ANA',            6500.00, 'BRL', 'estimated', NULL),
    -- Nordeste
    (trip_nordeste, 'flight', 'GRU - Guarulhos',     'FOR - Fortaleza',  (today + 30)::timestamp + TIME '06:00', (today + 30)::timestamp + TIME '09:30',  'GOL',             1200.00, 'BRL', 'reserved', 'G3-4412'),
    (trip_nordeste, 'transfer','Fortaleza',           'Jericoacoara',     (today + 30)::timestamp + TIME '11:00', (today + 30)::timestamp + TIME '15:00', 'Transfer VIP',      180.00, 'BRL', 'reserved', NULL),
    (trip_nordeste, 'flight', 'SLZ - Sao Luis',      'GRU - Guarulhos',  (today + 37)::timestamp + TIME '16:00', (today + 37)::timestamp + TIME '19:30', 'LATAM',            1100.00, 'BRL', 'reserved', 'LA-5521'),
    -- SP
    (trip_sp, 'flight', 'GIG - Galeao',             'CGH - Congonhas',  (today + 15)::timestamp + TIME '07:00', (today + 15)::timestamp + TIME '08:10', 'Azul',              380.00, 'BRL', 'reserved', 'AD-2291'),
    (trip_sp, 'flight', 'CGH - Congonhas',          'GIG - Galeao',     (today + 17)::timestamp + TIME '18:00', (today + 17)::timestamp + TIME '19:10', 'Azul',              380.00, 'BRL', 'reserved', 'AD-2298');

  -- ============================================================
  -- EXPERIENCIAS — 4. ITINERARY (Europa trip)
  -- ============================================================
  INSERT INTO trip_itinerary_items (trip_id, day_date, sort_order, title, category, estimated_time, estimated_cost, notes) VALUES
    -- Lisboa dia 1
    (trip_europa, today - 120, 1, 'Check-in hotel + descanso',           'rest',        '14:00', 0,      NULL),
    (trip_europa, today - 120, 2, 'Pasteis de Belem',                    'restaurant',  '16:00', 25.00,  'Nao esquecer nata!'),
    (trip_europa, today - 120, 3, 'Torre de Belem + Padrao',             'sightseeing', '17:00', 30.00,  NULL),
    (trip_europa, today - 120, 4, 'Jantar em Alfama',                    'restaurant',  '20:00', 120.00, 'Fado ao vivo'),
    -- Lisboa dia 2
    (trip_europa, today - 119, 1, 'Castelo de Sao Jorge',                'sightseeing', '09:00', 25.00,  NULL),
    (trip_europa, today - 119, 2, 'Praca do Comercio + Baixa',           'sightseeing', '11:00', 0,      NULL),
    (trip_europa, today - 119, 3, 'Time Out Market — almoco',            'restaurant',  '13:00', 80.00,  'Mercado gastronomico'),
    (trip_europa, today - 119, 4, 'Bairro Alto + Chiado',                'shopping',    '15:00', 150.00, NULL),
    -- Lisboa dia 3
    (trip_europa, today - 118, 1, 'Sintra — Palacio da Pena',            'sightseeing', '09:00', 45.00,  'Day trip de trem'),
    (trip_europa, today - 118, 2, 'Quinta da Regaleira',                 'sightseeing', '13:00', 20.00,  'Poco iniciatico'),
    (trip_europa, today - 118, 3, 'Cabo da Roca',                        'sightseeing', '16:00', 0,      'Ponto mais ocidental da Europa'),
    -- Porto dia 4-5
    (trip_europa, today - 116, 1, 'Trem Lisboa > Porto',                 'transport',   '08:30', 120.00, '3h viagem'),
    (trip_europa, today - 116, 2, 'Ribeira + Ponte D. Luis',             'sightseeing', '14:00', 0,      NULL),
    (trip_europa, today - 116, 3, 'Caves do vinho do Porto',             'sightseeing', '16:00', 40.00,  'Degustacao Taylor''s'),
    (trip_europa, today - 115, 1, 'Livraria Lello',                      'sightseeing', '10:00', 10.00,  'Chegar cedo'),
    (trip_europa, today - 115, 2, 'Torre dos Clerigos',                  'sightseeing', '12:00', 8.00,   NULL),
    (trip_europa, today - 115, 3, 'Francesinha autentica',               'restaurant',  '13:30', 45.00,  NULL);

  -- ============================================================
  -- EXPERIENCIAS — 5. BUDGET ITEMS
  -- ============================================================
  INSERT INTO trip_budget_items (trip_id, category, estimated_amount, actual_amount) VALUES
    -- Europa
    (trip_europa, 'accommodation',    4380.00, 4380.00),
    (trip_europa, 'air_transport',    6460.00, 6460.00),
    (trip_europa, 'ground_transport',  300.00,  280.00),
    (trip_europa, 'food',             3000.00, 2850.00),
    (trip_europa, 'tickets',           800.00,  720.00),
    (trip_europa, 'shopping',         1500.00, 1200.00),
    (trip_europa, 'insurance',         560.00,  560.00),
    -- Japao (planejamento)
    (trip_japao, 'accommodation',    5800.00,   0.00),
    (trip_japao, 'air_transport',   13000.00, 8500.00),
    (trip_japao, 'ground_transport',  850.00,   0.00),
    (trip_japao, 'food',             5000.00,   0.00),
    (trip_japao, 'tickets',          2500.00,   0.00),
    (trip_japao, 'shopping',         5000.00,   0.00),
    (trip_japao, 'insurance',         850.00,   0.00),
    -- Nordeste
    (trip_nordeste, 'accommodation', 2270.00, 2270.00),
    (trip_nordeste, 'air_transport', 2480.00, 2300.00),
    (trip_nordeste, 'ground_transport', 180.00, 180.00),
    (trip_nordeste, 'food',          2000.00,   0.00),
    (trip_nordeste, 'tickets',        800.00,   0.00),
    (trip_nordeste, 'insurance',      270.00,   0.00);

  -- ============================================================
  -- EXPERIENCIAS — 6. CHECKLISTS
  -- ============================================================
  INSERT INTO trip_checklist_items (trip_id, title, category, is_completed, sort_order) VALUES
    -- Japao checklist
    (trip_japao, 'Passaporte valido (6+ meses)',   'documents',   TRUE,  1),
    (trip_japao, 'Visto japones',                  'documents',   FALSE, 2),
    (trip_japao, 'Seguro viagem internacional',    'documents',   FALSE, 3),
    (trip_japao, 'Japan Rail Pass (14 dias)',       'before_trip', TRUE,  4),
    (trip_japao, 'Pocket WiFi reserva',            'before_trip', FALSE, 5),
    (trip_japao, 'Reservar ryokan Kyoto',          'before_trip', FALSE, 6),
    (trip_japao, 'Adaptador de tomada',            'luggage',     TRUE,  7),
    (trip_japao, 'Roupas de frio leve',            'luggage',     FALSE, 8),
    (trip_japao, 'Dolar convertido em iene',       'before_trip', FALSE, 9),
    (trip_japao, 'Instalar Google Translate offline','before_trip',TRUE, 10),
    (trip_japao, 'IC Card (Suica/Pasmo)',          'before_trip', FALSE, 11),
    (trip_japao, 'Farmacia basica',                'luggage',     TRUE,  12),
    -- Nordeste checklist
    (trip_nordeste, 'Protetor solar FPS 50+',      'luggage',     TRUE,  1),
    (trip_nordeste, 'Repelente',                   'luggage',     TRUE,  2),
    (trip_nordeste, 'Roupas leves e bermudas',     'luggage',     TRUE,  3),
    (trip_nordeste, 'Sandalia e tenis trail',      'luggage',     FALSE, 4),
    (trip_nordeste, 'Camera GoPro carregada',      'luggage',     TRUE,  5),
    (trip_nordeste, 'Reservar buggy Jericoacoara',  'before_trip', TRUE,  6),
    (trip_nordeste, 'Transfer aeroporto > Jeri',    'before_trip', TRUE,  7),
    (trip_nordeste, 'Reservar passeio Lencois',     'before_trip', FALSE, 8),
    -- SP checklist
    (trip_sp, 'Credencial do evento',              'documents',   TRUE,  1),
    (trip_sp, 'Notebook + carregador',             'luggage',     TRUE,  2),
    (trip_sp, 'Cartoes de visita',                 'luggage',     FALSE, 3),
    (trip_sp, 'Slides da palestra prontos',        'before_trip', FALSE, 4);

  -- ============================================================
  -- EXPERIENCIAS — 7. TRIP MEMORIES (viagens concluidas)
  -- ============================================================
  INSERT INTO trip_memories (trip_id, user_id, rating, favorite_moment, best_food, most_beautiful, lesson_learned, emotion_tags, budget_planned, budget_actual) VALUES
    (trip_europa, uid, 5,
     'Assistir ao por do sol no Miradouro da Graca com fado tocando ao fundo',
     'Bacalhau a Bras no restaurante Laurentina em Lisboa',
     'Nascer do sol no Parque Guell em Barcelona — a cidade inteira aos pes',
     'Viajar devagar vale mais que tentar ver tudo. Cada cidade merece pelo menos 3 dias.',
     ARRAY['felicidade', 'gratidao', 'aventura', 'romance'],
     18000.00, 16850.00),
    (trip_chile, uid, 4,
     'Geyser del Tatio ao amanhecer — -15C mas valeu cada segundo',
     'Empanadas de pino no Mercado Central de Santiago',
     'Valle de la Luna ao entardecer — parecia outro planeta',
     'O deserto ensina paciencia. Levar protetor solar industrial!',
     ARRAY['aventura', 'descoberta', 'superacao'],
     12000.00, 11200.00);

  -- ============================================================
  -- EXPERIENCIAS — 8. BUCKET LIST
  -- ============================================================
  INSERT INTO bucket_list_items (user_id, destination_country, destination_city, country_code, flag_emoji, continent, priority, estimated_budget, target_year, trip_type, motivation, status) VALUES
    (uid, 'Italia',         'Roma',           'IT', '🇮🇹', 'Europa',            'high',   20000.00, 2027, 'couple',  'Coliseu, Vaticano, gastronomia', 'pending'),
    (uid, 'Grecia',         'Santorini',      'GR', '🇬🇷', 'Europa',            'high',   18000.00, 2027, 'couple',  'Por do sol em Oia',              'pending'),
    (uid, 'Tailandia',      'Bangkok',        'TH', '🇹🇭', 'Asia',              'medium', 15000.00, 2028, 'couple',  'Templos e street food',          'pending'),
    (uid, 'Nova Zelandia',  'Queenstown',     'NZ', '🇳🇿', 'Oceania',           'medium', 30000.00, 2029, 'couple',  'Trilhas e paisagens epicas',     'pending'),
    (uid, 'Marrocos',       'Marrakech',      'MA', '🇲🇦', 'Africa',            'low',    12000.00, 2028, 'couple',  'Deserto do Saara + medina',      'pending'),
    (uid, 'Islandia',       'Reykjavik',      'IS', '🇮🇸', 'Europa',            'high',   25000.00, 2027, 'couple',  'Aurora boreal e Blue Lagoon',    'pending'),
    (uid, 'Argentina',      'Buenos Aires',   'AR', '🇦🇷', 'America do Sul',    'medium', 5000.00,  2026, 'couple',  'Tango, carne e vinho',           'pending'),
    (uid, 'Egito',          'Cairo',          'EG', '🇪🇬', 'Africa',            'low',    16000.00, 2029, 'couple',  'Piramides e Rio Nilo',           'pending');

  -- ============================================================
  -- EXPERIENCIAS — 9. PASSPORT BADGES (desbloqueados)
  -- ============================================================
  INSERT INTO passport_badges (user_id, badge_type, badge_name, xp_awarded, achieved_at) VALUES
    (uid, 'first_trip',          'Primeiro Voo',          50,  today - 240),
    (uid, 'south_america_start', 'Explorador Sulamericano', 30, today - 240),
    (uid, 'europe_start',        'Eurotrip Iniciante',    30,  today - 120),
    (uid, 'days_abroad_30',      '30 Dias no Exterior',   50,  today - 105);

  -- ============================================================
  RAISE NOTICE '';
  RAISE NOTICE '=== Seed Corpo + Experiencias concluido! ===';
  RAISE NOTICE '  Usuario: %', uid;
  RAISE NOTICE '';
  RAISE NOTICE '  CORPO:';
  RAISE NOTICE '    Health Profile:     1 (upsert)';
  RAISE NOTICE '    Weight Entries:     14 (90 dias)';
  RAISE NOTICE '    Activities:         20 (30 dias, streak 5)';
  RAISE NOTICE '    Daily Steps:        7 (semana)';
  RAISE NOTICE '    Appointments:       8 (3 scheduled, 4 completed, 1 cancelled)';
  RAISE NOTICE '    Meals:              12 (3 dias)';
  RAISE NOTICE '    Water Intake:       7 (semana)';
  RAISE NOTICE '';
  RAISE NOTICE '  EXPERIENCIAS:';
  RAISE NOTICE '    Trips:              5 (2 completed, 2 reserved, 1 planning)';
  RAISE NOTICE '    Accommodations:     12';
  RAISE NOTICE '    Transports:         18';
  RAISE NOTICE '    Itinerary Items:    17 (Europa trip)';
  RAISE NOTICE '    Budget Items:       20';
  RAISE NOTICE '    Checklist Items:    24';
  RAISE NOTICE '    Trip Memories:      2';
  RAISE NOTICE '    Bucket List:        8';
  RAISE NOTICE '    Passport Badges:    4';

END;
$$;
