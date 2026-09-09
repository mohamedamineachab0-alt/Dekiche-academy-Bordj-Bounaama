-- CreateTable
CREATE TABLE "Month" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Month_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Month_number_key" ON "Month"("number");

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN "monthId" TEXT;

-- CreateIndex
CREATE INDEX "Lesson_monthId_idx" ON "Lesson"("monthId");

-- AlterTable
ALTER TABLE "AccessCode" ADD COLUMN "monthId" TEXT;

-- CreateIndex
CREATE INDEX "AccessCode_monthId_idx" ON "AccessCode"("monthId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessCode" ADD CONSTRAINT "AccessCode_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed months 1–12 so the backfill script can attach to "Month 1"
INSERT INTO "Month" ("id", "number", "title", "createdAt")
SELECT gen_random_uuid()::text, n, 'الشهر ' || n::text, CURRENT_TIMESTAMP
FROM generate_series(1, 12) AS n
ON CONFLICT ("number") DO NOTHING;
