-- Amplía el CHECK constraint de notifications.type para incluir 'course_confirmed'.
-- Se emite cuando un curso alcanza su mínimo de alumnos el día de inicio.

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('low_enrollment', 'new_lead', 'event', 'course_confirmed'));
