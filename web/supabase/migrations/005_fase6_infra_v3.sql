-- ============================================================
-- MVP V3 — Fase 6: Infraestrutura dos novos módulos
-- Data: Fevereiro 2026
-- ============================================================

-- ============================================================
-- MÓDULO FUTURO (substitui goals do v2)
-- ============================================================
CREATE TABLE objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🎯',
    category TEXT NOT NULL CHECK (category IN (
        'financial','health','professional','educational',
        'experience','personal','other'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
    target_date DATE,
    target_date_reason TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed','archived')),
    completed_at TIMESTAMP,
    progress DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE TABLE objective_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    target_module TEXT NOT NULL CHECK (target_module IN (
        'financas','tempo','corpo','mente','patrimonio','carreira','experiencias'
    )),
    indicator_type TEXT NOT NULL CHECK (indicator_type IN (
        'monetary','weight','task','frequency','percentage','quantity','linked'
    )),
    target_value DECIMAL(15,2),
    current_value DECIMAL(15,2) DEFAULT 0,
    initial_value DECIMAL(15,2),
    target_unit TEXT,
    linked_entity_type TEXT,
    linked_entity_id UUID,
    weight DECIMAL(3,1) DEFAULT 1.0 CHECK (weight BETWEEN 0.5 AND 3.0),
    frequency_period TEXT CHECK (frequency_period IN ('daily','weekly','monthly')),
    frequency_target INTEGER,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
    progress DECIMAL(5,2) DEFAULT 0,
    completed_at TIMESTAMP,
    last_progress_update TIMESTAMP,
    auto_sync BOOLEAN DEFAULT TRUE,
    agenda_event_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE objective_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objective_id UUID REFERENCES objectives(id) ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES objective_goals(id),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'created','goal_added','goal_completed','goal_removed',
        'progress_50','progress_75','progress_90',
        'objective_completed','objective_edited',
        'objective_paused','objective_resumed'
    )),
    description TEXT NOT NULL,
    progress_snapshot DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MÓDULO CORPO
-- ============================================================
CREATE TABLE health_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
    height_cm DECIMAL(5,1),
    current_weight DECIMAL(5,1),
    biological_sex TEXT CHECK (biological_sex IN ('male','female')),
    birth_date DATE,
    activity_level TEXT CHECK (activity_level IN (
        'sedentary','light','moderate','very_active','extreme'
    )),
    weight_goal_type TEXT CHECK (weight_goal_type IN ('lose','maintain','gain')),
    weight_goal_kg DECIMAL(5,1),
    daily_steps_goal INTEGER DEFAULT 8000,
    weekly_activity_goal INTEGER DEFAULT 3,
    min_activity_minutes INTEGER DEFAULT 30,
    bmr DECIMAL(8,2),
    tdee DECIMAL(8,2),
    dietary_restrictions TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE weight_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    weight DECIMAL(5,1) NOT NULL,
    body_fat_pct DECIMAL(4,1),
    waist_cm DECIMAL(5,1),
    hip_cm DECIMAL(5,1),
    arm_cm DECIMAL(5,1),
    thigh_cm DECIMAL(5,1),
    chest_cm DECIMAL(5,1),
    recorded_at DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE medical_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    specialty TEXT NOT NULL,
    doctor_name TEXT,
    location TEXT,
    appointment_date TIMESTAMP NOT NULL,
    cost DECIMAL(10,2),
    notes TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
    follow_up_months INTEGER,
    follow_up_status TEXT CHECK (follow_up_status IN ('pending','scheduled','ignored')),
    follow_up_reminder_date DATE,
    follow_up_reminder_count INTEGER DEFAULT 0,
    agenda_event_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    type TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    distance_km DECIMAL(6,2),
    steps INTEGER,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
    calories_burned DECIMAL(8,2),
    met_value DECIMAL(4,2),
    recorded_at TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    week_start DATE NOT NULL,
    plan_json JSONB NOT NULL,
    locked_days INTEGER[] DEFAULT '{}',
    dietary_restrictions TEXT[],
    weekly_budget DECIMAL(10,2),
    regeneration_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE daily_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    recorded_date DATE NOT NULL,
    steps INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, recorded_date)
);

-- ============================================================
-- MÓDULO MENTE
-- ============================================================
CREATE TABLE study_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'technology','languages','management','marketing','design',
        'finance','health','exam','undergraduate','postgraduate',
        'certification','other'
    )),
    status TEXT DEFAULT 'in_progress' CHECK (status IN (
        'in_progress','paused','completed','abandoned'
    )),
    target_date DATE,
    progress DECIMAL(5,2) DEFAULT 0,
    total_hours DECIMAL(8,2) DEFAULT 0,
    cost DECIMAL(10,2),
    linked_skill_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_track_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES study_tracks(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    sort_order INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE focus_sessions_mente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    track_id UUID REFERENCES study_tracks(id),
    duration_minutes INTEGER NOT NULL,
    focus_minutes INTEGER NOT NULL,
    break_minutes INTEGER NOT NULL,
    cycles_completed INTEGER DEFAULT 0,
    session_notes TEXT,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID REFERENCES study_tracks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('link','book','video','pdf','note','other')),
    url TEXT,
    personal_notes TEXT,
    status TEXT DEFAULT 'to_study' CHECK (status IN ('to_study','studying','completed')),
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE study_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MÓDULO CARREIRA
-- ============================================================
CREATE TABLE professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
    current_title TEXT,
    current_company TEXT,
    field TEXT CHECK (field IN (
        'technology','finance','health','education','law',
        'engineering','marketing','sales','hr','design','management','other'
    )),
    level TEXT CHECK (level IN (
        'intern','junior','mid','senior','specialist',
        'coordinator','manager','director','c_level','freelancer','entrepreneur'
    )),
    gross_salary DECIMAL(12,2),
    start_date DATE,
    sync_salary_to_finance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE career_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    title TEXT NOT NULL,
    company TEXT,
    field TEXT,
    level TEXT,
    salary DECIMAL(12,2),
    start_date DATE NOT NULL,
    end_date DATE,
    change_type TEXT CHECK (change_type IN (
        'initial','promotion','lateral','company_change','salary_change','other'
    )),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE career_roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    current_title TEXT NOT NULL,
    target_title TEXT NOT NULL,
    target_salary DECIMAL(12,2),
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','paused','abandoned')),
    progress DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID REFERENCES career_roadmaps(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
    progress DECIMAL(5,2) DEFAULT 0,
    sort_order INTEGER NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    category TEXT CHECK (category IN ('hard_skill','soft_skill','language','certification')),
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roadmap_step_skills (
    step_id UUID REFERENCES roadmap_steps(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (step_id, skill_id)
);

CREATE TABLE skill_study_tracks (
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    track_id UUID REFERENCES study_tracks(id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, track_id)
);

-- ============================================================
-- MÓDULO PATRIMÔNIO
-- ============================================================
CREATE TABLE portfolio_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    ticker TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    asset_class TEXT NOT NULL CHECK (asset_class IN (
        'stocks_br','fiis','etfs_br','bdrs','fixed_income',
        'crypto','stocks_us','reits','other'
    )),
    sector TEXT,
    quantity DECIMAL(15,8) NOT NULL DEFAULT 0,
    avg_price DECIMAL(15,4) NOT NULL DEFAULT 0,
    current_price DECIMAL(15,4),
    last_price_update TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE portfolio_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    asset_id UUID REFERENCES portfolio_assets(id) NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('buy','sell')),
    quantity DECIMAL(15,8) NOT NULL,
    price DECIMAL(15,4) NOT NULL,
    fees DECIMAL(10,2) DEFAULT 0,
    operation_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE portfolio_dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    asset_id UUID REFERENCES portfolio_assets(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN (
        'dividend','jcp','fii_yield','fixed_income_interest','other'
    )),
    amount_per_unit DECIMAL(15,6),
    total_amount DECIMAL(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    ex_date DATE,
    status TEXT DEFAULT 'received' CHECK (status IN ('announced','received')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fi_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    current_portfolio DECIMAL(15,2) NOT NULL,
    monthly_contribution DECIMAL(15,2) NOT NULL,
    expected_return_rate DECIMAL(5,2) NOT NULL,
    desired_passive_income DECIMAL(15,2) NOT NULL,
    result_months INTEGER,
    result_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- MÓDULO EXPERIÊNCIAS
-- ============================================================
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    destinations TEXT[] NOT NULL,
    trip_type TEXT CHECK (trip_type IN ('leisure','work','study','mixed')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    travelers_count INTEGER DEFAULT 1,
    total_budget DECIMAL(12,2),
    total_spent DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    status TEXT DEFAULT 'planning' CHECK (status IN (
        'planning','reserved','ongoing','completed','cancelled'
    )),
    notes TEXT,
    objective_id UUID REFERENCES objectives(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    cost_per_night DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('estimated','reserved','paid')),
    confirmation_code TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_transports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('flight','train','bus','car_rental','taxi','transfer','other')),
    origin TEXT,
    destination TEXT,
    departure_datetime TIMESTAMP,
    arrival_datetime TIMESTAMP,
    company TEXT,
    cost DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    booking_status TEXT DEFAULT 'pending' CHECK (booking_status IN ('estimated','reserved','paid')),
    confirmation_code TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_itinerary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    day_date DATE NOT NULL,
    sort_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'sightseeing','restaurant','museum','beach','shopping',
        'transport','rest','other'
    )),
    address TEXT,
    estimated_time TIME,
    estimated_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'BRL',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    category TEXT CHECK (category IN (
        'accommodation','air_transport','ground_transport',
        'food','tickets','shopping','insurance','documents','other'
    )),
    estimated_amount DECIMAL(10,2) DEFAULT 0,
    actual_amount DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'BRL',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('documents','luggage','before_trip','other')),
    is_completed BOOLEAN DEFAULT FALSE,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE trip_ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================
CREATE INDEX idx_objectives_user_status ON objectives(user_id, status);
CREATE INDEX idx_objective_goals_objective ON objective_goals(objective_id);
CREATE INDEX idx_objective_goals_module ON objective_goals(target_module);
CREATE INDEX idx_weight_entries_user_date ON weight_entries(user_id, recorded_at);
CREATE INDEX idx_appointments_user_status ON medical_appointments(user_id, status);
CREATE INDEX idx_activities_user_date ON activities(user_id, recorded_at);
CREATE INDEX idx_study_tracks_user ON study_tracks(user_id, status);
CREATE INDEX idx_focus_sessions_mente_user ON focus_sessions_mente(user_id, recorded_at);
CREATE INDEX idx_career_roadmaps_user ON career_roadmaps(user_id, status);
CREATE INDEX idx_skills_user ON skills(user_id);
CREATE INDEX idx_portfolio_assets_user ON portfolio_assets(user_id);
CREATE INDEX idx_portfolio_dividends_user_date ON portfolio_dividends(user_id, payment_date);
CREATE INDEX idx_trips_user ON trips(user_id, status);
CREATE INDEX idx_trip_itinerary_day ON trip_itinerary_items(trip_id, day_date);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_track_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions_mente ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE fi_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies padrão: user só acessa seus próprios dados
-- Nota: tabelas filhas (trip_accommodations, etc.) não têm user_id direto
-- Então usamos policy baseada em JOIN com tabela pai
CREATE POLICY "objectives_user_policy" ON objectives FOR ALL USING (user_id = auth.uid());
CREATE POLICY "objective_goals_user_policy" ON objective_goals FOR ALL USING (user_id = auth.uid());
CREATE POLICY "objective_milestones_user_policy" ON objective_milestones FOR ALL
    USING (objective_id IN (SELECT id FROM objectives WHERE user_id = auth.uid()));
CREATE POLICY "health_profiles_user_policy" ON health_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "weight_entries_user_policy" ON weight_entries FOR ALL USING (user_id = auth.uid());
CREATE POLICY "medical_appointments_user_policy" ON medical_appointments FOR ALL USING (user_id = auth.uid());
CREATE POLICY "activities_user_policy" ON activities FOR ALL USING (user_id = auth.uid());
CREATE POLICY "meal_plans_user_policy" ON meal_plans FOR ALL USING (user_id = auth.uid());
CREATE POLICY "daily_steps_user_policy" ON daily_steps FOR ALL USING (user_id = auth.uid());
CREATE POLICY "study_tracks_user_policy" ON study_tracks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "study_track_steps_user_policy" ON study_track_steps FOR ALL
    USING (track_id IN (SELECT id FROM study_tracks WHERE user_id = auth.uid()));
CREATE POLICY "focus_sessions_mente_user_policy" ON focus_sessions_mente FOR ALL USING (user_id = auth.uid());
CREATE POLICY "study_resources_user_policy" ON study_resources FOR ALL USING (user_id = auth.uid());
CREATE POLICY "study_streaks_user_policy" ON study_streaks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "professional_profiles_user_policy" ON professional_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "career_history_user_policy" ON career_history FOR ALL USING (user_id = auth.uid());
CREATE POLICY "career_roadmaps_user_policy" ON career_roadmaps FOR ALL USING (user_id = auth.uid());
CREATE POLICY "roadmap_steps_user_policy" ON roadmap_steps FOR ALL
    USING (roadmap_id IN (SELECT id FROM career_roadmaps WHERE user_id = auth.uid()));
CREATE POLICY "skills_user_policy" ON skills FOR ALL USING (user_id = auth.uid());
CREATE POLICY "portfolio_assets_user_policy" ON portfolio_assets FOR ALL USING (user_id = auth.uid());
CREATE POLICY "portfolio_transactions_user_policy" ON portfolio_transactions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "portfolio_dividends_user_policy" ON portfolio_dividends FOR ALL USING (user_id = auth.uid());
CREATE POLICY "fi_simulations_user_policy" ON fi_simulations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "trips_user_policy" ON trips FOR ALL USING (user_id = auth.uid());
CREATE POLICY "trip_accommodations_user_policy" ON trip_accommodations FOR ALL
    USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
CREATE POLICY "trip_transports_user_policy" ON trip_transports FOR ALL
    USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
CREATE POLICY "trip_itinerary_items_user_policy" ON trip_itinerary_items FOR ALL
    USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
CREATE POLICY "trip_budget_items_user_policy" ON trip_budget_items FOR ALL
    USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
CREATE POLICY "trip_checklist_items_user_policy" ON trip_checklist_items FOR ALL
    USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
CREATE POLICY "trip_ai_conversations_user_policy" ON trip_ai_conversations FOR ALL
    USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));
