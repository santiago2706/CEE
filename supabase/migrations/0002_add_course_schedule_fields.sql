ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS duration_weeks       integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS schedule_description text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS start_date           date    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_students         integer DEFAULT NULL;
