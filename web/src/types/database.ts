export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // ─── BASE ──────────────────────────────────────────────────────
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          monthly_income: number | null
          savings_goal_pct: number | null
          plan_type: string
          theme: string
          active_modules: string[]
          sidebar_expanded: boolean
          reduced_motion: boolean
          compact_numbers: boolean
          life_moments: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          monthly_income?: number | null
          savings_goal_pct?: number | null
          plan_type?: string
          theme?: string
          active_modules?: string[]
          sidebar_expanded?: boolean
          reduced_motion?: boolean
          compact_numbers?: boolean
          life_moments?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          monthly_income?: number | null
          savings_goal_pct?: number | null
          plan_type?: string
          theme?: string
          active_modules?: string[]
          sidebar_expanded?: boolean
          reduced_motion?: boolean
          compact_numbers?: boolean
          life_moments?: Json
          created_at?: string
          updated_at?: string
        }
      }

      // ─── FINANCE ───────────────────────────────────────────────────
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          icon: string | null
          color: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          icon?: string | null
          color?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          icon?: string | null
          color?: string | null
          is_default?: boolean
          created_at?: string
        }
      }

      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          type: string
          description: string | null
          date: string
          payment_method: string | null
          is_recurring: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          type: string
          description?: string | null
          date: string
          payment_method?: string | null
          is_recurring?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          type?: string
          description?: string | null
          date?: string
          payment_method?: string | null
          is_recurring?: boolean
          notes?: string | null
          created_at?: string
        }
      }

      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          month: number
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          month: number
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          month?: number
          year?: number
          created_at?: string
        }
      }

      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          type: string
          description: string
          frequency: string
          day_of_month: number | null
          start_date: string
          end_date: string | null
          is_active: boolean
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          type: string
          description: string
          frequency: string
          day_of_month?: number | null
          start_date: string
          end_date?: string | null
          is_active?: boolean
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          type?: string
          description?: string
          frequency?: string
          day_of_month?: number | null
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ─── FUTURE / GOALS ────────────────────────────────────────────
      objectives: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          icon: string
          category: string
          priority: string
          target_date: string | null
          target_date_reason: string | null
          status: string
          completed_at: string | null
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          icon: string
          category: string
          priority: string
          target_date?: string | null
          target_date_reason?: string | null
          status?: string
          completed_at?: string | null
          progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          icon?: string
          category?: string
          priority?: string
          target_date?: string | null
          target_date_reason?: string | null
          status?: string
          completed_at?: string | null
          progress?: number
          created_at?: string
          updated_at?: string
        }
      }

      objective_goals: {
        Row: {
          id: string
          objective_id: string
          user_id: string
          name: string
          target_module: string
          indicator_type: string
          target_value: number | null
          current_value: number
          initial_value: number | null
          target_unit: string | null
          linked_entity_type: string | null
          linked_entity_id: string | null
          weight: number
          frequency_period: string | null
          frequency_target: number | null
          status: string
          progress: number
          completed_at: string | null
          last_progress_update: string | null
          auto_sync: boolean
          agenda_event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          objective_id: string
          user_id: string
          name: string
          target_module: string
          indicator_type: string
          target_value?: number | null
          current_value?: number
          initial_value?: number | null
          target_unit?: string | null
          linked_entity_type?: string | null
          linked_entity_id?: string | null
          weight?: number
          frequency_period?: string | null
          frequency_target?: number | null
          status?: string
          progress?: number
          completed_at?: string | null
          last_progress_update?: string | null
          auto_sync?: boolean
          agenda_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          objective_id?: string
          user_id?: string
          name?: string
          target_module?: string
          indicator_type?: string
          target_value?: number | null
          current_value?: number
          initial_value?: number | null
          target_unit?: string | null
          linked_entity_type?: string | null
          linked_entity_id?: string | null
          weight?: number
          frequency_period?: string | null
          frequency_target?: number | null
          status?: string
          progress?: number
          completed_at?: string | null
          last_progress_update?: string | null
          auto_sync?: boolean
          agenda_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      objective_milestones: {
        Row: {
          id: string
          objective_id: string
          goal_id: string | null
          event_type: string
          description: string
          progress_snapshot: number | null
          created_at: string
        }
        Insert: {
          id?: string
          objective_id: string
          goal_id?: string | null
          event_type: string
          description: string
          progress_snapshot?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          objective_id?: string
          goal_id?: string | null
          event_type?: string
          description?: string
          progress_snapshot?: number | null
          created_at?: string
        }
      }

      // ─── GOALS V2 (LEGACY) ─────────────────────────────────────────
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_value: number
          current_value: number
          deadline: string | null
          type: string
          category: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_value: number
          current_value?: number
          deadline?: string | null
          type: string
          category?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_value?: number
          current_value?: number
          deadline?: string | null
          type?: string
          category?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }

      goal_contributions: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          amount: number
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          amount: number
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          amount?: number
          date?: string
          notes?: string | null
          created_at?: string
        }
      }

      goal_milestones: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          name: string
          target_pct: number
          reached_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          name: string
          target_pct: number
          reached_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          name?: string
          target_pct?: number
          reached_at?: string | null
          created_at?: string
        }
      }

      // ─── AGENDA / TEMPO ────────────────────────────────────────────
      agenda_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          type: string
          date: string
          all_day: boolean
          start_time: string | null
          end_time: string | null
          priority: string
          status: string
          reminder: string | null
          recurrence: string
          goal_id: string | null
          location: string | null
          checklist: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          type: string
          date: string
          all_day?: boolean
          start_time?: string | null
          end_time?: string | null
          priority?: string
          status?: string
          reminder?: string | null
          recurrence?: string
          goal_id?: string | null
          location?: string | null
          checklist?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          type?: string
          date?: string
          all_day?: boolean
          start_time?: string | null
          end_time?: string | null
          priority?: string
          status?: string
          reminder?: string | null
          recurrence?: string
          goal_id?: string | null
          location?: string | null
          checklist?: Json
          created_at?: string
          updated_at?: string
        }
      }

      focus_sessions: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          event_id: string | null
          duration_minutes: number
          date: string
          start_time: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          event_id?: string | null
          duration_minutes: number
          date: string
          start_time?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          event_id?: string | null
          duration_minutes?: number
          date?: string
          start_time?: string | null
          notes?: string | null
          created_at?: string
        }
      }

      // ─── BODY / HEALTH ─────────────────────────────────────────────
      health_profiles: {
        Row: {
          id: string
          user_id: string
          height_cm: number | null
          current_weight: number | null
          biological_sex: string | null
          birth_date: string | null
          activity_level: string | null
          weight_goal_type: string | null
          weight_goal_kg: number | null
          daily_steps_goal: number
          weekly_activity_goal: number
          min_activity_minutes: number
          daily_water_goal_ml: number
          bmr: number | null
          tdee: number | null
          dietary_restrictions: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          height_cm?: number | null
          current_weight?: number | null
          biological_sex?: string | null
          birth_date?: string | null
          activity_level?: string | null
          weight_goal_type?: string | null
          weight_goal_kg?: number | null
          daily_steps_goal?: number
          weekly_activity_goal?: number
          min_activity_minutes?: number
          daily_water_goal_ml?: number
          bmr?: number | null
          tdee?: number | null
          dietary_restrictions?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          height_cm?: number | null
          current_weight?: number | null
          biological_sex?: string | null
          birth_date?: string | null
          activity_level?: string | null
          weight_goal_type?: string | null
          weight_goal_kg?: number | null
          daily_steps_goal?: number
          weekly_activity_goal?: number
          min_activity_minutes?: number
          daily_water_goal_ml?: number
          bmr?: number | null
          tdee?: number | null
          dietary_restrictions?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }

      weight_entries: {
        Row: {
          id: string
          user_id: string
          weight: number
          body_fat_pct: number | null
          waist_cm: number | null
          hip_cm: number | null
          arm_cm: number | null
          thigh_cm: number | null
          chest_cm: number | null
          recorded_at: string
          progress_photo_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          body_fat_pct?: number | null
          waist_cm?: number | null
          hip_cm?: number | null
          arm_cm?: number | null
          thigh_cm?: number | null
          chest_cm?: number | null
          recorded_at: string
          progress_photo_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          body_fat_pct?: number | null
          waist_cm?: number | null
          hip_cm?: number | null
          arm_cm?: number | null
          thigh_cm?: number | null
          chest_cm?: number | null
          recorded_at?: string
          progress_photo_url?: string | null
          notes?: string | null
          created_at?: string
        }
      }

      medical_appointments: {
        Row: {
          id: string
          user_id: string
          specialty: string
          doctor_name: string | null
          location: string | null
          appointment_date: string
          cost: number | null
          attachment_url: string | null
          notes: string | null
          status: string
          follow_up_months: number | null
          follow_up_status: string | null
          follow_up_reminder_date: string | null
          follow_up_reminder_count: number
          agenda_event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialty: string
          doctor_name?: string | null
          location?: string | null
          appointment_date: string
          cost?: number | null
          attachment_url?: string | null
          notes?: string | null
          status?: string
          follow_up_months?: number | null
          follow_up_status?: string | null
          follow_up_reminder_date?: string | null
          follow_up_reminder_count?: number
          agenda_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialty?: string
          doctor_name?: string | null
          location?: string | null
          appointment_date?: string
          cost?: number | null
          attachment_url?: string | null
          notes?: string | null
          status?: string
          follow_up_months?: number | null
          follow_up_status?: string | null
          follow_up_reminder_date?: string | null
          follow_up_reminder_count?: number
          agenda_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      activities: {
        Row: {
          id: string
          user_id: string
          type: string
          duration_minutes: number
          distance_km: number | null
          steps: number | null
          intensity: number | null
          calories_burned: number | null
          met_value: number | null
          recorded_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          duration_minutes: number
          distance_km?: number | null
          steps?: number | null
          intensity?: number | null
          calories_burned?: number | null
          met_value?: number | null
          recorded_at: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          duration_minutes?: number
          distance_km?: number | null
          steps?: number | null
          intensity?: number | null
          calories_burned?: number | null
          met_value?: number | null
          recorded_at?: string
          notes?: string | null
          created_at?: string
        }
      }

      meals: {
        Row: {
          id: string
          user_id: string
          meal_slot: string
          description: string
          calories_kcal: number
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          meal_time: string | null
          recorded_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_slot: string
          description: string
          calories_kcal: number
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          meal_time?: string | null
          recorded_at: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_slot?: string
          description?: string
          calories_kcal?: number
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          meal_time?: string | null
          recorded_at?: string
          notes?: string | null
          created_at?: string
        }
      }

      meal_plans: {
        Row: {
          id: string
          user_id: string
          week_start: string
          plan_json: Json
          locked_days: number[]
          dietary_restrictions: string[] | null
          weekly_budget: number | null
          regeneration_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          plan_json: Json
          locked_days?: number[]
          dietary_restrictions?: string[] | null
          weekly_budget?: number | null
          regeneration_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          plan_json?: Json
          locked_days?: number[]
          dietary_restrictions?: string[] | null
          weekly_budget?: number | null
          regeneration_count?: number
          created_at?: string
        }
      }

      daily_steps: {
        Row: {
          id: string
          user_id: string
          recorded_date: string
          steps: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recorded_date: string
          steps: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recorded_date?: string
          steps?: number
          created_at?: string
        }
      }

      daily_water_intake: {
        Row: {
          id: string
          user_id: string
          recorded_date: string
          intake_ml: number
          goal_ml: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recorded_date: string
          intake_ml: number
          goal_ml: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recorded_date?: string
          intake_ml?: number
          goal_ml?: number
          created_at?: string
          updated_at?: string
        }
      }

      // ─── MIND / STUDY ──────────────────────────────────────────────
      study_tracks: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          status: string
          target_date: string | null
          progress: number
          total_hours: number
          cost: number | null
          linked_skill_id: string | null
          linked_objective_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          status?: string
          target_date?: string | null
          progress?: number
          total_hours?: number
          cost?: number | null
          linked_skill_id?: string | null
          linked_objective_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          status?: string
          target_date?: string | null
          progress?: number
          total_hours?: number
          cost?: number | null
          linked_skill_id?: string | null
          linked_objective_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      study_track_steps: {
        Row: {
          id: string
          track_id: string
          title: string
          is_completed: boolean
          completed_at: string | null
          sort_order: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          track_id: string
          title: string
          is_completed?: boolean
          completed_at?: string | null
          sort_order: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          title?: string
          is_completed?: boolean
          completed_at?: string | null
          sort_order?: number
          notes?: string | null
          created_at?: string
        }
      }

      focus_sessions_mente: {
        Row: {
          id: string
          user_id: string
          track_id: string | null
          duration_minutes: number
          focus_minutes: number
          break_minutes: number
          cycles_completed: number
          session_notes: string | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          track_id?: string | null
          duration_minutes: number
          focus_minutes: number
          break_minutes: number
          cycles_completed: number
          session_notes?: string | null
          recorded_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string | null
          duration_minutes?: number
          focus_minutes?: number
          break_minutes?: number
          cycles_completed?: number
          session_notes?: string | null
          recorded_at?: string
          created_at?: string
        }
      }

      study_resources: {
        Row: {
          id: string
          track_id: string
          user_id: string
          title: string
          type: string | null
          url: string | null
          personal_notes: string | null
          status: string
          sort_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          track_id: string
          user_id: string
          title: string
          type?: string | null
          url?: string | null
          personal_notes?: string | null
          status?: string
          sort_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          user_id?: string
          title?: string
          type?: string | null
          url?: string | null
          personal_notes?: string | null
          status?: string
          sort_order?: number | null
          created_at?: string
        }
      }

      study_streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_study_date: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_study_date?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_study_date?: string | null
          updated_at?: string
        }
      }

      library_resources: {
        Row: {
          id: string
          user_id: string
          title: string
          url: string | null
          type: string
          track_id: string | null
          notes: string | null
          tags: string[]
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          url?: string | null
          type: string
          track_id?: string | null
          notes?: string | null
          tags?: string[]
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          url?: string | null
          type?: string
          track_id?: string | null
          notes?: string | null
          tags?: string[]
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ─── CAREER ────────────────────────────────────────────────────
      professional_profiles: {
        Row: {
          id: string
          user_id: string
          current_title: string | null
          current_company: string | null
          field: string | null
          level: string | null
          gross_salary: number | null
          start_date: string | null
          sync_salary_to_finance: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_title?: string | null
          current_company?: string | null
          field?: string | null
          level?: string | null
          gross_salary?: number | null
          start_date?: string | null
          sync_salary_to_finance?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_title?: string | null
          current_company?: string | null
          field?: string | null
          level?: string | null
          gross_salary?: number | null
          start_date?: string | null
          sync_salary_to_finance?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      career_profiles: {
        Row: {
          id: string
          user_id: string
          current_position: string | null
          target_role: string | null
          industry: string | null
          years_experience: number | null
          education_level: string | null
          linkedin_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_position?: string | null
          target_role?: string | null
          industry?: string | null
          years_experience?: number | null
          education_level?: string | null
          linkedin_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_position?: string | null
          target_role?: string | null
          industry?: string | null
          years_experience?: number | null
          education_level?: string | null
          linkedin_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      career_history: {
        Row: {
          id: string
          user_id: string
          title: string
          company: string | null
          field: string | null
          level: string | null
          salary: number | null
          start_date: string
          end_date: string | null
          change_type: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          company?: string | null
          field?: string | null
          level?: string | null
          salary?: number | null
          start_date: string
          end_date?: string | null
          change_type?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          company?: string | null
          field?: string | null
          level?: string | null
          salary?: number | null
          start_date?: string
          end_date?: string | null
          change_type?: string | null
          notes?: string | null
          created_at?: string
        }
      }

      career_roadmaps: {
        Row: {
          id: string
          user_id: string
          name: string
          current_title: string
          target_title: string
          target_salary: number | null
          target_date: string | null
          status: string
          progress: number
          linked_objective_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          current_title: string
          target_title: string
          target_salary?: number | null
          target_date?: string | null
          status?: string
          progress?: number
          linked_objective_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          current_title?: string
          target_title?: string
          target_salary?: number | null
          target_date?: string | null
          status?: string
          progress?: number
          linked_objective_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      roadmap_steps: {
        Row: {
          id: string
          roadmap_id: string
          title: string
          description: string | null
          target_date: string | null
          status: string
          progress: number
          sort_order: number
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          roadmap_id: string
          title: string
          description?: string | null
          target_date?: string | null
          status?: string
          progress?: number
          sort_order: number
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          roadmap_id?: string
          title?: string
          description?: string | null
          target_date?: string | null
          status?: string
          progress?: number
          sort_order?: number
          completed_at?: string | null
          created_at?: string
        }
      }

      skills: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string | null
          proficiency_level: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string | null
          proficiency_level?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string | null
          proficiency_level?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ─── PORTFOLIO ─────────────────────────────────────────────────
      portfolio_assets: {
        Row: {
          id: string
          user_id: string
          ticker: string
          asset_name: string
          asset_class: string
          sector: string | null
          quantity: number
          avg_price: number
          current_price: number | null
          last_price_update: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ticker: string
          asset_name: string
          asset_class: string
          sector?: string | null
          quantity: number
          avg_price: number
          current_price?: number | null
          last_price_update?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ticker?: string
          asset_name?: string
          asset_class?: string
          sector?: string | null
          quantity?: number
          avg_price?: number
          current_price?: number | null
          last_price_update?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      portfolio_transactions: {
        Row: {
          id: string
          user_id: string
          asset_id: string
          operation: string
          quantity: number
          price: number
          fees: number
          operation_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_id: string
          operation: string
          quantity: number
          price: number
          fees?: number
          operation_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset_id?: string
          operation?: string
          quantity?: number
          price?: number
          fees?: number
          operation_date?: string
          notes?: string | null
          created_at?: string
        }
      }

      portfolio_dividends: {
        Row: {
          id: string
          user_id: string
          asset_id: string
          type: string
          amount_per_unit: number | null
          total_amount: number
          payment_date: string
          ex_date: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_id: string
          type: string
          amount_per_unit?: number | null
          total_amount: number
          payment_date: string
          ex_date?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset_id?: string
          type?: string
          amount_per_unit?: number | null
          total_amount?: number
          payment_date?: string
          ex_date?: string | null
          status?: string
          created_at?: string
        }
      }

      fi_simulations: {
        Row: {
          id: string
          user_id: string
          current_portfolio: number
          monthly_contribution: number
          expected_return_rate: number
          desired_passive_income: number
          result_months: number | null
          result_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_portfolio: number
          monthly_contribution: number
          expected_return_rate: number
          desired_passive_income: number
          result_months?: number | null
          result_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_portfolio?: number
          monthly_contribution?: number
          expected_return_rate?: number
          desired_passive_income?: number
          result_months?: number | null
          result_date?: string | null
          created_at?: string
        }
      }

      // ─── EXPERIENCES ───────────────────────────────────────────────
      trips: {
        Row: {
          id: string
          user_id: string
          name: string
          destinations: string[]
          trip_type: string | null
          start_date: string
          end_date: string
          travelers_count: number
          total_budget: number | null
          total_spent: number
          currency: string
          status: string
          notes: string | null
          objective_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          destinations: string[]
          trip_type?: string | null
          start_date: string
          end_date: string
          travelers_count?: number
          total_budget?: number | null
          total_spent?: number
          currency?: string
          status?: string
          notes?: string | null
          objective_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          destinations?: string[]
          trip_type?: string | null
          start_date?: string
          end_date?: string
          travelers_count?: number
          total_budget?: number | null
          total_spent?: number
          currency?: string
          status?: string
          notes?: string | null
          objective_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      trip_accommodations: {
        Row: {
          id: string
          trip_id: string
          name: string
          address: string | null
          check_in: string
          check_out: string
          cost_per_night: number | null
          total_cost: number | null
          currency: string
          booking_status: string
          confirmation_code: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          name: string
          address?: string | null
          check_in: string
          check_out: string
          cost_per_night?: number | null
          total_cost?: number | null
          currency?: string
          booking_status?: string
          confirmation_code?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          name?: string
          address?: string | null
          check_in?: string
          check_out?: string
          cost_per_night?: number | null
          total_cost?: number | null
          currency?: string
          booking_status?: string
          confirmation_code?: string | null
          notes?: string | null
          created_at?: string
        }
      }

      trip_transports: {
        Row: {
          id: string
          trip_id: string
          type: string | null
          origin: string | null
          destination: string | null
          departure_datetime: string | null
          arrival_datetime: string | null
          company: string | null
          cost: number | null
          currency: string
          booking_status: string
          confirmation_code: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          type?: string | null
          origin?: string | null
          destination?: string | null
          departure_datetime?: string | null
          arrival_datetime?: string | null
          company?: string | null
          cost?: number | null
          currency?: string
          booking_status?: string
          confirmation_code?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          type?: string | null
          origin?: string | null
          destination?: string | null
          departure_datetime?: string | null
          arrival_datetime?: string | null
          company?: string | null
          cost?: number | null
          currency?: string
          booking_status?: string
          confirmation_code?: string | null
          notes?: string | null
          created_at?: string
        }
      }

      trip_itinerary_items: {
        Row: {
          id: string
          trip_id: string
          day_date: string
          sort_order: number
          title: string
          category: string | null
          address: string | null
          estimated_time: string | null
          estimated_cost: number | null
          currency: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          day_date: string
          sort_order: number
          title: string
          category?: string | null
          address?: string | null
          estimated_time?: string | null
          estimated_cost?: number | null
          currency?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          day_date?: string
          sort_order?: number
          title?: string
          category?: string | null
          address?: string | null
          estimated_time?: string | null
          estimated_cost?: number | null
          currency?: string
          notes?: string | null
          created_at?: string
        }
      }

      trip_budget_items: {
        Row: {
          id: string
          trip_id: string
          category: string | null
          estimated_amount: number
          actual_amount: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          category?: string | null
          estimated_amount: number
          actual_amount?: number
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          category?: string | null
          estimated_amount?: number
          actual_amount?: number
          currency?: string
          created_at?: string
        }
      }

      trip_checklist_items: {
        Row: {
          id: string
          trip_id: string
          title: string
          category: string | null
          is_completed: boolean
          sort_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          title: string
          category?: string | null
          is_completed?: boolean
          sort_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          title?: string
          category?: string | null
          is_completed?: boolean
          sort_order?: number | null
          created_at?: string
        }
      }

      trip_ai_conversations: {
        Row: {
          id: string
          trip_id: string
          user_message: string
          ai_response: string
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_message: string
          ai_response: string
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_message?: string
          ai_response?: string
          created_at?: string
        }
      }

      trip_memories: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          rating: number
          favorite_moment: string | null
          best_food: string | null
          most_beautiful: string | null
          lesson_learned: string | null
          emotion_tags: string[]
          budget_planned: number | null
          budget_actual: number | null
          xp_awarded: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          user_id: string
          rating: number
          favorite_moment?: string | null
          best_food?: string | null
          most_beautiful?: string | null
          lesson_learned?: string | null
          emotion_tags?: string[]
          budget_planned?: number | null
          budget_actual?: number | null
          xp_awarded?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          user_id?: string
          rating?: number
          favorite_moment?: string | null
          best_food?: string | null
          most_beautiful?: string | null
          lesson_learned?: string | null
          emotion_tags?: string[]
          budget_planned?: number | null
          budget_actual?: number | null
          xp_awarded?: number
          created_at?: string
          updated_at?: string
        }
      }

      bucket_list_items: {
        Row: {
          id: string
          user_id: string
          destination_country: string
          destination_city: string | null
          country_code: string | null
          flag_emoji: string | null
          continent: string | null
          priority: string
          estimated_budget: number | null
          target_year: number | null
          trip_type: string | null
          motivation: string | null
          status: string
          trip_id: string | null
          visited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination_country: string
          destination_city?: string | null
          country_code?: string | null
          flag_emoji?: string | null
          continent?: string | null
          priority?: string
          estimated_budget?: number | null
          target_year?: number | null
          trip_type?: string | null
          motivation?: string | null
          status?: string
          trip_id?: string | null
          visited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          destination_country?: string
          destination_city?: string | null
          country_code?: string | null
          flag_emoji?: string | null
          continent?: string | null
          priority?: string
          estimated_budget?: number | null
          target_year?: number | null
          trip_type?: string | null
          motivation?: string | null
          status?: string
          trip_id?: string | null
          visited_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      passport_badges: {
        Row: {
          id: string
          user_id: string
          badge_type: string
          badge_name: string
          xp_awarded: number
          achieved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: string
          badge_name: string
          xp_awarded?: number
          achieved_at: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_type?: string
          badge_name?: string
          xp_awarded?: number
          achieved_at?: string
        }
      }

      // ─── GAMIFICATION ──────────────────────────────────────────────
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          rarity: string
          points: number
          criteria_type: string
          criteria_value: Json
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          category: string
          rarity: string
          points?: number
          criteria_type: string
          criteria_value: Json
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          category?: string
          rarity?: string
          points?: number
          criteria_type?: string
          criteria_value?: Json
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }

      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          unlocked_at: string
          notified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          unlocked_at: string
          notified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          unlocked_at?: string
          notified?: boolean
          created_at?: string
        }
      }

      life_sync_scores: {
        Row: {
          id: string
          user_id: string
          score: number
          financas_score: number | null
          futuro_score: number | null
          corpo_score: number | null
          mente_score: number | null
          patrimonio_score: number | null
          carreira_score: number | null
          tempo_score: number | null
          experiencias_score: number | null
          recorded_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          financas_score?: number | null
          futuro_score?: number | null
          corpo_score?: number | null
          mente_score?: number | null
          patrimonio_score?: number | null
          carreira_score?: number | null
          tempo_score?: number | null
          experiencias_score?: number | null
          recorded_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          financas_score?: number | null
          futuro_score?: number | null
          corpo_score?: number | null
          mente_score?: number | null
          patrimonio_score?: number | null
          carreira_score?: number | null
          tempo_score?: number | null
          experiencias_score?: number | null
          recorded_date?: string
          created_at?: string
        }
      }

      user_streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_activity_date: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string | null
          updated_at?: string
        }
      }

      weekly_reviews: {
        Row: {
          id: string
          user_id: string
          week_start: string
          week_end: string
          data: Json
          completed_at: string | null
          shared: boolean
          created_at: string
          score_gained: number | null
        }
        Insert: {
          id?: string
          user_id: string
          week_start: string
          week_end: string
          data: Json
          completed_at?: string | null
          shared?: boolean
          created_at?: string
          score_gained?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          week_start?: string
          week_end?: string
          data?: Json
          completed_at?: string | null
          shared?: boolean
          created_at?: string
          score_gained?: number | null
        }
      }

      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string
          module: string | null
          action_url: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body: string
          module?: string | null
          action_url?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string
          module?: string | null
          action_url?: string | null
          read_at?: string | null
          created_at?: string
        }
      }

      user_xp_log: {
        Row: {
          id: string
          user_id: string
          action: string
          points: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          points: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          points?: number
          metadata?: Json
          created_at?: string
        }
      }

      // ─── JUNCTION TABLES ───────────────────────────────────────────
      roadmap_step_skills: {
        Row: {
          step_id: string
          skill_id: string
        }
        Insert: {
          step_id: string
          skill_id: string
        }
        Update: {
          step_id?: string
          skill_id?: string
        }
      }

      skill_study_tracks: {
        Row: {
          skill_id: string
          track_id: string
        }
        Insert: {
          skill_id: string
          track_id: string
        }
        Update: {
          skill_id?: string
          track_id?: string
        }
      }

      planning_events: {
        Row: {
          id: string
          user_id: string
          name: string
          planned_date: string
          amount: number
          type: string
          category_id: string | null
          is_recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          planned_date: string
          amount: number
          type: string
          category_id?: string | null
          is_recurring?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          planned_date?: string
          amount?: number
          type?: string
          category_id?: string | null
          is_recurring?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ─── CONVENIENCE TYPE ALIASES ──────────────────────────────────────

// Base
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Finance
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type Budget = Database['public']['Tables']['budgets']['Row']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']

export type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']
export type RecurringTransactionInsert = Database['public']['Tables']['recurring_transactions']['Insert']
export type RecurringTransactionUpdate = Database['public']['Tables']['recurring_transactions']['Update']

// Future / Goals
export type Objective = Database['public']['Tables']['objectives']['Row']
export type ObjectiveInsert = Database['public']['Tables']['objectives']['Insert']
export type ObjectiveUpdate = Database['public']['Tables']['objectives']['Update']

export type ObjectiveGoal = Database['public']['Tables']['objective_goals']['Row']
export type ObjectiveGoalInsert = Database['public']['Tables']['objective_goals']['Insert']
export type ObjectiveGoalUpdate = Database['public']['Tables']['objective_goals']['Update']

export type ObjectiveMilestone = Database['public']['Tables']['objective_milestones']['Row']
export type ObjectiveMilestoneInsert = Database['public']['Tables']['objective_milestones']['Insert']
export type ObjectiveMilestoneUpdate = Database['public']['Tables']['objective_milestones']['Update']

// Goals V2 (legacy)
export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']

export type GoalContribution = Database['public']['Tables']['goal_contributions']['Row']
export type GoalContributionInsert = Database['public']['Tables']['goal_contributions']['Insert']
export type GoalContributionUpdate = Database['public']['Tables']['goal_contributions']['Update']

export type GoalMilestone = Database['public']['Tables']['goal_milestones']['Row']
export type GoalMilestoneInsert = Database['public']['Tables']['goal_milestones']['Insert']
export type GoalMilestoneUpdate = Database['public']['Tables']['goal_milestones']['Update']

// Agenda / Tempo
export type AgendaEvent = Database['public']['Tables']['agenda_events']['Row']
export type AgendaEventInsert = Database['public']['Tables']['agenda_events']['Insert']
export type AgendaEventUpdate = Database['public']['Tables']['agenda_events']['Update']

export type FocusSession = Database['public']['Tables']['focus_sessions']['Row']
export type FocusSessionInsert = Database['public']['Tables']['focus_sessions']['Insert']
export type FocusSessionUpdate = Database['public']['Tables']['focus_sessions']['Update']

// Body / Health
export type HealthProfile = Database['public']['Tables']['health_profiles']['Row']
export type HealthProfileInsert = Database['public']['Tables']['health_profiles']['Insert']
export type HealthProfileUpdate = Database['public']['Tables']['health_profiles']['Update']

export type WeightEntry = Database['public']['Tables']['weight_entries']['Row']
export type WeightEntryInsert = Database['public']['Tables']['weight_entries']['Insert']
export type WeightEntryUpdate = Database['public']['Tables']['weight_entries']['Update']

export type MedicalAppointment = Database['public']['Tables']['medical_appointments']['Row']
export type MedicalAppointmentInsert = Database['public']['Tables']['medical_appointments']['Insert']
export type MedicalAppointmentUpdate = Database['public']['Tables']['medical_appointments']['Update']

export type Activity = Database['public']['Tables']['activities']['Row']
export type ActivityInsert = Database['public']['Tables']['activities']['Insert']
export type ActivityUpdate = Database['public']['Tables']['activities']['Update']

export type Meal = Database['public']['Tables']['meals']['Row']
export type MealInsert = Database['public']['Tables']['meals']['Insert']
export type MealUpdate = Database['public']['Tables']['meals']['Update']

export type MealPlan = Database['public']['Tables']['meal_plans']['Row']
export type MealPlanInsert = Database['public']['Tables']['meal_plans']['Insert']
export type MealPlanUpdate = Database['public']['Tables']['meal_plans']['Update']

export type DailySteps = Database['public']['Tables']['daily_steps']['Row']
export type DailyStepsInsert = Database['public']['Tables']['daily_steps']['Insert']
export type DailyStepsUpdate = Database['public']['Tables']['daily_steps']['Update']

export type DailyWaterIntake = Database['public']['Tables']['daily_water_intake']['Row']
export type DailyWaterIntakeInsert = Database['public']['Tables']['daily_water_intake']['Insert']
export type DailyWaterIntakeUpdate = Database['public']['Tables']['daily_water_intake']['Update']

// Mind / Study
export type StudyTrack = Database['public']['Tables']['study_tracks']['Row']
export type StudyTrackInsert = Database['public']['Tables']['study_tracks']['Insert']
export type StudyTrackUpdate = Database['public']['Tables']['study_tracks']['Update']

export type StudyTrackStep = Database['public']['Tables']['study_track_steps']['Row']
export type StudyTrackStepInsert = Database['public']['Tables']['study_track_steps']['Insert']
export type StudyTrackStepUpdate = Database['public']['Tables']['study_track_steps']['Update']

export type FocusSessionMente = Database['public']['Tables']['focus_sessions_mente']['Row']
export type FocusSessionMenteInsert = Database['public']['Tables']['focus_sessions_mente']['Insert']
export type FocusSessionMenteUpdate = Database['public']['Tables']['focus_sessions_mente']['Update']

export type StudyResource = Database['public']['Tables']['study_resources']['Row']
export type StudyResourceInsert = Database['public']['Tables']['study_resources']['Insert']
export type StudyResourceUpdate = Database['public']['Tables']['study_resources']['Update']

export type StudyStreak = Database['public']['Tables']['study_streaks']['Row']
export type StudyStreakInsert = Database['public']['Tables']['study_streaks']['Insert']
export type StudyStreakUpdate = Database['public']['Tables']['study_streaks']['Update']

export type LibraryResource = Database['public']['Tables']['library_resources']['Row']
export type LibraryResourceInsert = Database['public']['Tables']['library_resources']['Insert']
export type LibraryResourceUpdate = Database['public']['Tables']['library_resources']['Update']

// Career
export type ProfessionalProfile = Database['public']['Tables']['professional_profiles']['Row']
export type ProfessionalProfileInsert = Database['public']['Tables']['professional_profiles']['Insert']
export type ProfessionalProfileUpdate = Database['public']['Tables']['professional_profiles']['Update']

export type CareerProfile = Database['public']['Tables']['career_profiles']['Row']
export type CareerProfileInsert = Database['public']['Tables']['career_profiles']['Insert']
export type CareerProfileUpdate = Database['public']['Tables']['career_profiles']['Update']

export type CareerHistory = Database['public']['Tables']['career_history']['Row']
export type CareerHistoryInsert = Database['public']['Tables']['career_history']['Insert']
export type CareerHistoryUpdate = Database['public']['Tables']['career_history']['Update']

export type CareerRoadmap = Database['public']['Tables']['career_roadmaps']['Row']
export type CareerRoadmapInsert = Database['public']['Tables']['career_roadmaps']['Insert']
export type CareerRoadmapUpdate = Database['public']['Tables']['career_roadmaps']['Update']

export type RoadmapStep = Database['public']['Tables']['roadmap_steps']['Row']
export type RoadmapStepInsert = Database['public']['Tables']['roadmap_steps']['Insert']
export type RoadmapStepUpdate = Database['public']['Tables']['roadmap_steps']['Update']

export type Skill = Database['public']['Tables']['skills']['Row']
export type SkillInsert = Database['public']['Tables']['skills']['Insert']
export type SkillUpdate = Database['public']['Tables']['skills']['Update']

// Portfolio
export type PortfolioAsset = Database['public']['Tables']['portfolio_assets']['Row']
export type PortfolioAssetInsert = Database['public']['Tables']['portfolio_assets']['Insert']
export type PortfolioAssetUpdate = Database['public']['Tables']['portfolio_assets']['Update']

export type PortfolioTransaction = Database['public']['Tables']['portfolio_transactions']['Row']
export type PortfolioTransactionInsert = Database['public']['Tables']['portfolio_transactions']['Insert']
export type PortfolioTransactionUpdate = Database['public']['Tables']['portfolio_transactions']['Update']

export type PortfolioDividend = Database['public']['Tables']['portfolio_dividends']['Row']
export type PortfolioDividendInsert = Database['public']['Tables']['portfolio_dividends']['Insert']
export type PortfolioDividendUpdate = Database['public']['Tables']['portfolio_dividends']['Update']

export type FiSimulation = Database['public']['Tables']['fi_simulations']['Row']
export type FiSimulationInsert = Database['public']['Tables']['fi_simulations']['Insert']
export type FiSimulationUpdate = Database['public']['Tables']['fi_simulations']['Update']

// Experiences
export type Trip = Database['public']['Tables']['trips']['Row']
export type TripInsert = Database['public']['Tables']['trips']['Insert']
export type TripUpdate = Database['public']['Tables']['trips']['Update']

export type TripAccommodation = Database['public']['Tables']['trip_accommodations']['Row']
export type TripAccommodationInsert = Database['public']['Tables']['trip_accommodations']['Insert']
export type TripAccommodationUpdate = Database['public']['Tables']['trip_accommodations']['Update']

export type TripTransport = Database['public']['Tables']['trip_transports']['Row']
export type TripTransportInsert = Database['public']['Tables']['trip_transports']['Insert']
export type TripTransportUpdate = Database['public']['Tables']['trip_transports']['Update']

export type TripItineraryItem = Database['public']['Tables']['trip_itinerary_items']['Row']
export type TripItineraryItemInsert = Database['public']['Tables']['trip_itinerary_items']['Insert']
export type TripItineraryItemUpdate = Database['public']['Tables']['trip_itinerary_items']['Update']

export type TripBudgetItem = Database['public']['Tables']['trip_budget_items']['Row']
export type TripBudgetItemInsert = Database['public']['Tables']['trip_budget_items']['Insert']
export type TripBudgetItemUpdate = Database['public']['Tables']['trip_budget_items']['Update']

export type TripChecklistItem = Database['public']['Tables']['trip_checklist_items']['Row']
export type TripChecklistItemInsert = Database['public']['Tables']['trip_checklist_items']['Insert']
export type TripChecklistItemUpdate = Database['public']['Tables']['trip_checklist_items']['Update']

export type TripAiConversation = Database['public']['Tables']['trip_ai_conversations']['Row']
export type TripAiConversationInsert = Database['public']['Tables']['trip_ai_conversations']['Insert']
export type TripAiConversationUpdate = Database['public']['Tables']['trip_ai_conversations']['Update']

export type TripMemory = Database['public']['Tables']['trip_memories']['Row']
export type TripMemoryInsert = Database['public']['Tables']['trip_memories']['Insert']
export type TripMemoryUpdate = Database['public']['Tables']['trip_memories']['Update']

export type BucketListItem = Database['public']['Tables']['bucket_list_items']['Row']
export type BucketListItemInsert = Database['public']['Tables']['bucket_list_items']['Insert']
export type BucketListItemUpdate = Database['public']['Tables']['bucket_list_items']['Update']

export type PassportBadge = Database['public']['Tables']['passport_badges']['Row']
export type PassportBadgeInsert = Database['public']['Tables']['passport_badges']['Insert']
export type PassportBadgeUpdate = Database['public']['Tables']['passport_badges']['Update']

// Gamification
export type Badge = Database['public']['Tables']['badges']['Row']
export type BadgeInsert = Database['public']['Tables']['badges']['Insert']
export type BadgeUpdate = Database['public']['Tables']['badges']['Update']

export type UserBadge = Database['public']['Tables']['user_badges']['Row']
export type UserBadgeInsert = Database['public']['Tables']['user_badges']['Insert']
export type UserBadgeUpdate = Database['public']['Tables']['user_badges']['Update']

export type LifeSyncScore = Database['public']['Tables']['life_sync_scores']['Row']
export type LifeSyncScoreInsert = Database['public']['Tables']['life_sync_scores']['Insert']
export type LifeSyncScoreUpdate = Database['public']['Tables']['life_sync_scores']['Update']

export type UserStreak = Database['public']['Tables']['user_streaks']['Row']
export type UserStreakInsert = Database['public']['Tables']['user_streaks']['Insert']
export type UserStreakUpdate = Database['public']['Tables']['user_streaks']['Update']

export type WeeklyReview = Database['public']['Tables']['weekly_reviews']['Row']
export type WeeklyReviewInsert = Database['public']['Tables']['weekly_reviews']['Insert']
export type WeeklyReviewUpdate = Database['public']['Tables']['weekly_reviews']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type UserXpLog = Database['public']['Tables']['user_xp_log']['Row']
export type UserXpLogInsert = Database['public']['Tables']['user_xp_log']['Insert']
export type UserXpLogUpdate = Database['public']['Tables']['user_xp_log']['Update']

// Junction Tables
export type RoadmapStepSkill = Database['public']['Tables']['roadmap_step_skills']['Row']
export type RoadmapStepSkillInsert = Database['public']['Tables']['roadmap_step_skills']['Insert']
export type RoadmapStepSkillUpdate = Database['public']['Tables']['roadmap_step_skills']['Update']

export type SkillStudyTrack = Database['public']['Tables']['skill_study_tracks']['Row']
export type SkillStudyTrackInsert = Database['public']['Tables']['skill_study_tracks']['Insert']
export type SkillStudyTrackUpdate = Database['public']['Tables']['skill_study_tracks']['Update']

export type PlanningEvent = Database['public']['Tables']['planning_events']['Row']
export type PlanningEventInsert = Database['public']['Tables']['planning_events']['Insert']
export type PlanningEventUpdate = Database['public']['Tables']['planning_events']['Update']
