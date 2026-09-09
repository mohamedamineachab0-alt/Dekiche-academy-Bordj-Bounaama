-- Link generated daily exercises and review cards to their parent lesson.

ALTER TABLE "DailyExercise" ADD COLUMN IF NOT EXISTS "lessonId" TEXT;
ALTER TABLE "ReviewCard" ADD COLUMN IF NOT EXISTS "lessonId" TEXT;

CREATE INDEX IF NOT EXISTS "DailyExercise_lessonId_idx" ON "DailyExercise"("lessonId");
CREATE INDEX IF NOT EXISTS "ReviewCard_lessonId_idx" ON "ReviewCard"("lessonId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DailyExercise_lessonId_fkey'
  ) THEN
    ALTER TABLE "DailyExercise"
      ADD CONSTRAINT "DailyExercise_lessonId_fkey"
      FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ReviewCard_lessonId_fkey'
  ) THEN
    ALTER TABLE "ReviewCard"
      ADD CONSTRAINT "ReviewCard_lessonId_fkey"
      FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
