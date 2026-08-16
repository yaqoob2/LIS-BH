-- CreateEnum
CREATE TYPE "DeadlineStatus" AS ENUM ('OPEN', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "deadlines" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "deadline_type" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "DeadlineStatus" NOT NULL DEFAULT 'OPEN',
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deadlines_case_id_idx" ON "deadlines"("case_id");

-- CreateIndex
CREATE INDEX "deadlines_due_date_idx" ON "deadlines"("due_date");

-- CreateIndex
CREATE INDEX "deadlines_status_idx" ON "deadlines"("status");

-- CreateIndex
CREATE INDEX "deadlines_created_by_idx" ON "deadlines"("created_by");

-- CreateIndex
CREATE INDEX "deadlines_updated_by_idx" ON "deadlines"("updated_by");

-- AddForeignKey
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deadlines" ADD CONSTRAINT "deadlines_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
