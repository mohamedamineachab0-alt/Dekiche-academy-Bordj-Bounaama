-- CreateTable
CREATE TABLE "AdminAiInsight" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "studentId" TEXT,
    "summary" TEXT NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAiInsight_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "loginCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ParentProfile" ADD COLUMN "lastReviewedAt" TIMESTAMP(3);
ALTER TABLE "ParentProfile" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "User_role_lastLoginAt_idx" ON "User"("role", "lastLoginAt");

-- CreateIndex
CREATE INDEX "StudentMistake_studentId_createdAt_idx" ON "StudentMistake"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "StudentMistake_lessonId_idx" ON "StudentMistake"("lessonId");

-- CreateIndex
CREATE INDEX "AdminAiInsight_scope_createdAt_idx" ON "AdminAiInsight"("scope", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAiInsight_studentId_createdAt_idx" ON "AdminAiInsight"("studentId", "createdAt");

-- AddForeignKey
ALTER TABLE "AdminAiInsight" ADD CONSTRAINT "AdminAiInsight_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
