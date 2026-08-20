ALTER TABLE "Lesson" DROP CONSTRAINT IF EXISTS "Lesson_subjectId_fkey";
ALTER TABLE "Lesson" DROP COLUMN IF EXISTS "subjectId";
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "streams" "Stream"[] DEFAULT ARRAY[]::"Stream"[];

CREATE TABLE IF NOT EXISTS "_LessonSubjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_LessonSubjects_AB_unique" ON "_LessonSubjects"("A", "B");
CREATE INDEX IF NOT EXISTS "_LessonSubjects_B_index" ON "_LessonSubjects"("B");

ALTER TABLE "_LessonSubjects" DROP CONSTRAINT IF EXISTS "_LessonSubjects_A_fkey";
ALTER TABLE "_LessonSubjects" ADD CONSTRAINT "_LessonSubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_LessonSubjects" DROP CONSTRAINT IF EXISTS "_LessonSubjects_B_fkey";
ALTER TABLE "_LessonSubjects" ADD CONSTRAINT "_LessonSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
