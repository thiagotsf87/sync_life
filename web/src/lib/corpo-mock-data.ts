/**
 * Mock data para validação visual do módulo Corpo Mobile.
 * Usado como fallback quando os dados reais do Supabase estão vazios.
 */

import type {
  HealthProfile, WeightEntry, MedicalAppointment,
  Activity, Meal, DailyWaterIntake,
} from '@/hooks/use-corpo'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}
function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(10, 30, 0, 0)
  return d.toISOString()
}
function today(): string {
  return new Date().toISOString().split('T')[0]
}

const UID = 'mock-user-000'

export const MOCK_PROFILE: HealthProfile = {
  id: 'mock-profile-1',
  user_id: UID,
  height_cm: 175,
  current_weight: 82.3,
  biological_sex: 'male',
  birth_date: '1992-06-15',
  activity_level: 'moderate',
  weight_goal_type: 'lose',
  weight_goal_kg: 76,
  daily_steps_goal: 10000,
  weekly_activity_goal: 4,
  min_activity_minutes: 45,
  bmr: 1855,
  tdee: 2870,
  dietary_restrictions: [],
  created_at: daysAgo(90),
  updated_at: daysAgo(1),
}

export const MOCK_WEIGHT_ENTRIES: WeightEntry[] = [
  {
    id: 'w1', user_id: UID,
    weight: 82.3, body_fat_pct: 18.5,
    waist_cm: 88, hip_cm: 95, arm_cm: 36, thigh_cm: 56, chest_cm: 100,
    recorded_at: daysAgo(0), notes: null, progress_photo_url: null, created_at: daysAgo(0),
  },
  {
    id: 'w2', user_id: UID,
    weight: 82.8, body_fat_pct: null,
    waist_cm: null, hip_cm: null, arm_cm: null, thigh_cm: null, chest_cm: null,
    recorded_at: daysAgo(3), notes: null, progress_photo_url: null, created_at: daysAgo(3),
  },
  {
    id: 'w3', user_id: UID,
    weight: 83.1, body_fat_pct: 19.0,
    waist_cm: 89, hip_cm: 95, arm_cm: null, thigh_cm: null, chest_cm: null,
    recorded_at: daysAgo(7), notes: null, progress_photo_url: null, created_at: daysAgo(7),
  },
  {
    id: 'w4', user_id: UID,
    weight: 83.5, body_fat_pct: null,
    waist_cm: null, hip_cm: null, arm_cm: null, thigh_cm: null, chest_cm: null,
    recorded_at: daysAgo(10), notes: null, progress_photo_url: null, created_at: daysAgo(10),
  },
  {
    id: 'w5', user_id: UID,
    weight: 84.0, body_fat_pct: 19.3,
    waist_cm: 90, hip_cm: 96, arm_cm: 37, thigh_cm: 57, chest_cm: 101,
    recorded_at: daysAgo(14), notes: null, progress_photo_url: null, created_at: daysAgo(14),
  },
  {
    id: 'w6', user_id: UID,
    weight: 84.4, body_fat_pct: null,
    waist_cm: null, hip_cm: null, arm_cm: null, thigh_cm: null, chest_cm: null,
    recorded_at: daysAgo(18), notes: null, progress_photo_url: null, created_at: daysAgo(18),
  },
  {
    id: 'w7', user_id: UID,
    weight: 84.8, body_fat_pct: null,
    waist_cm: null, hip_cm: null, arm_cm: null, thigh_cm: null, chest_cm: null,
    recorded_at: daysAgo(21), notes: null, progress_photo_url: null, created_at: daysAgo(21),
  },
  {
    id: 'w8', user_id: UID,
    weight: 85.2, body_fat_pct: 19.9,
    waist_cm: 91, hip_cm: 97, arm_cm: 37, thigh_cm: 58, chest_cm: 102,
    recorded_at: daysAgo(28), notes: null, progress_photo_url: null, created_at: daysAgo(28),
  },
]

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 'a1', user_id: UID, type: 'running', duration_minutes: 35, distance_km: 5.2, steps: 5800, intensity: 7, calories_burned: 318, met_value: 9.8, recorded_at: daysAgo(0), notes: 'Corrida matinal', created_at: daysAgo(0) },
  { id: 'a2', user_id: UID, type: 'weightlifting', duration_minutes: 60, distance_km: null, steps: null, intensity: 8, calories_burned: 285, met_value: 6.0, recorded_at: daysAgo(1), notes: 'Peito e tríceps', created_at: daysAgo(1) },
  { id: 'a3', user_id: UID, type: 'yoga', duration_minutes: 45, distance_km: null, steps: null, intensity: 4, calories_burned: 175, met_value: 3.8, recorded_at: daysAgo(2), notes: null, created_at: daysAgo(2) },
  { id: 'a4', user_id: UID, type: 'cycling', duration_minutes: 40, distance_km: 18.0, steps: null, intensity: 6, calories_burned: 340, met_value: 8.5, recorded_at: daysAgo(4), notes: 'Ciclismo outdoor', created_at: daysAgo(4) },
  { id: 'a5', user_id: UID, type: 'running', duration_minutes: 30, distance_km: 4.5, steps: 5100, intensity: 6, calories_burned: 280, met_value: 9.0, recorded_at: daysAgo(7), notes: null, created_at: daysAgo(7) },
  { id: 'a6', user_id: UID, type: 'swimming', duration_minutes: 50, distance_km: 1.5, steps: null, intensity: 7, calories_burned: 395, met_value: 7.8, recorded_at: daysAgo(9), notes: 'Nado livre', created_at: daysAgo(9) },
  { id: 'a7', user_id: UID, type: 'weightlifting', duration_minutes: 65, distance_km: null, steps: null, intensity: 8, calories_burned: 305, met_value: 6.0, recorded_at: daysAgo(11), notes: 'Costas e bíceps', created_at: daysAgo(11) },
  { id: 'a8', user_id: UID, type: 'running', duration_minutes: 45, distance_km: 7.0, steps: 7900, intensity: 7, calories_burned: 410, met_value: 9.5, recorded_at: daysAgo(14), notes: 'Long run', created_at: daysAgo(14) },
]

// nextAppointment — próxima consulta futura
export const MOCK_APPOINTMENTS: MedicalAppointment[] = [
  {
    id: 'appt1', user_id: UID,
    specialty: 'Dentista',
    doctor_name: 'Dra. Ana Lima',
    location: 'Clínica OralCare — Av. Paulista, 1000',
    appointment_date: daysFromNow(5),
    cost: 180,
    notes: 'Limpeza e revisão semestral',
    attachment_url: null,
    status: 'scheduled',
    follow_up_months: 6,
    follow_up_status: null,
    follow_up_reminder_date: null,
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
  },
  {
    id: 'appt2', user_id: UID,
    specialty: 'Cardiologista',
    doctor_name: 'Dr. Roberto Melo',
    location: 'Hospital São Lucas',
    appointment_date: daysFromNow(22),
    cost: 350,
    notes: 'Check-up anual',
    attachment_url: null,
    status: 'scheduled',
    follow_up_months: 12,
    follow_up_status: null,
    follow_up_reminder_date: null,
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
  },
  {
    id: 'appt3', user_id: UID,
    specialty: 'Clínico Geral',
    doctor_name: 'Dra. Paula Costa',
    location: 'UBS Centro',
    appointment_date: daysAgo(45),
    cost: 0,
    notes: 'Exames de rotina',
    attachment_url: null,
    status: 'completed',
    follow_up_months: null,
    follow_up_status: 'pending',
    follow_up_reminder_date: daysFromNow(15),
    created_at: daysAgo(60),
    updated_at: daysAgo(45),
  },
]

export const MOCK_MEALS: Meal[] = [
  {
    id: 'm1', user_id: UID,
    meal_slot: 'breakfast',
    description: 'Aveia com banana e mel + café preto',
    calories_kcal: 385, protein_g: 12, carbs_g: 74, fat_g: 7,
    meal_time: '07:30', recorded_at: today(), notes: null, created_at: daysAgo(0),
  },
  {
    id: 'm2', user_id: UID,
    meal_slot: 'lunch',
    description: 'Frango grelhado + arroz integral + feijão + salada',
    calories_kcal: 640, protein_g: 44, carbs_g: 75, fat_g: 11,
    meal_time: '12:30', recorded_at: today(), notes: null, created_at: daysAgo(0),
  },
  {
    id: 'm3', user_id: UID,
    meal_slot: 'snack',
    description: 'Iogurte grego 0% + granola artesanal',
    calories_kcal: 275, protein_g: 19, carbs_g: 33, fat_g: 7,
    meal_time: '15:45', recorded_at: today(), notes: null, created_at: daysAgo(0),
  },
  {
    id: 'm4', user_id: UID,
    meal_slot: 'dinner',
    description: 'Omelete de legumes + salada verde com azeite',
    calories_kcal: 390, protein_g: 26, carbs_g: 16, fat_g: 24,
    meal_time: '19:30', recorded_at: today(), notes: null, created_at: daysAgo(0),
  },
]

export const MOCK_WATER: DailyWaterIntake = {
  id: 'water1', user_id: UID,
  recorded_date: today(),
  intake_ml: 1750,
  goal_ml: 2500,
  created_at: daysAgo(0),
  updated_at: daysAgo(0),
}
