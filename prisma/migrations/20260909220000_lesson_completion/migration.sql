-- Track when a student marks a lesson as watched.

CREATE TABLE "LessonCompletion" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LessonCompletion_studentId_lessonId_key" ON "LessonCompletion"("studentId", "lessonId");

CREATE INDEX "LessonCompletion_studentId_completedAt_idx" ON "LessonCompletion"("studentId", "completedAt");

CREATE INDEX "LessonCompletion_lessonId_idx" ON "LessonCompletion"("lessonId");

ALTER TABLE "LessonCompletion"
  ADD CONSTRAINT "LessonCompletion_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LessonCompletion"
  ADD CONSTRAINT "LessonCompletion_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
