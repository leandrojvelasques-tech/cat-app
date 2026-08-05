-- Preserve the exact classes purchased when an attendee selects one or more loose classes.
ALTER TABLE "EventRegistration"
ADD COLUMN IF NOT EXISTS "selectedClassIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
