-- The events and event_registrations tables already exist.
-- This migration adds the slug column needed for public-facing URLs.

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS events_slug_idx
  ON public.events (slug)
  WHERE slug IS NOT NULL;
