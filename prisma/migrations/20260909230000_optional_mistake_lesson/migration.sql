-- Allow mistakes from daily exercises and exams, not only lesson quizzes.

ALTER TABLE "StudentMistake" ALTER COLUMN "lessonId" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "StudentMistake_quizId_idx" ON "StudentMistake"("quizId");
