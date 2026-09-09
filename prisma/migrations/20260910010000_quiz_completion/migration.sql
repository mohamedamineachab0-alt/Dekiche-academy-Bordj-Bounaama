-- CreateTable
CREATE TABLE "QuizCompletion" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizCompletion_studentId_quizId_key" ON "QuizCompletion"("studentId", "quizId");

-- CreateIndex
CREATE INDEX "QuizCompletion_studentId_completedAt_idx" ON "QuizCompletion"("studentId", "completedAt");

-- CreateIndex
CREATE INDEX "QuizCompletion_quizId_idx" ON "QuizCompletion"("quizId");

-- AddForeignKey
ALTER TABLE "QuizCompletion" ADD CONSTRAINT "QuizCompletion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizCompletion" ADD CONSTRAINT "QuizCompletion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill from existing mistakes (student already sat that quiz)
INSERT INTO "QuizCompletion" ("id", "studentId", "quizId", "score", "completedAt")
SELECT gen_random_uuid()::text, "studentId", "quizId", 0, MIN("createdAt")
FROM "StudentMistake"
GROUP BY "studentId", "quizId"
ON CONFLICT ("studentId", "quizId") DO NOTHING;
