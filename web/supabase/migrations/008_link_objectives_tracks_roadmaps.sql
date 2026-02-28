BEGIN;

-- RN-MNT-04 / RN-CAR-12
-- Permite vincular trilhas e roadmaps a um objetivo do Futuro.
ALTER TABLE public.study_tracks
  ADD COLUMN IF NOT EXISTS linked_objective_id UUID;

ALTER TABLE public.career_roadmaps
  ADD COLUMN IF NOT EXISTS linked_objective_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'study_tracks_linked_objective_fk'
      AND table_name = 'study_tracks'
  ) THEN
    ALTER TABLE public.study_tracks
      ADD CONSTRAINT study_tracks_linked_objective_fk
      FOREIGN KEY (linked_objective_id) REFERENCES public.objectives(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'career_roadmaps_linked_objective_fk'
      AND table_name = 'career_roadmaps'
  ) THEN
    ALTER TABLE public.career_roadmaps
      ADD CONSTRAINT career_roadmaps_linked_objective_fk
      FOREIGN KEY (linked_objective_id) REFERENCES public.objectives(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_study_tracks_linked_objective ON public.study_tracks(linked_objective_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_linked_objective ON public.career_roadmaps(linked_objective_id);

COMMIT;

