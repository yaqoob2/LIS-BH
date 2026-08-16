-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'AWAITING_RESPONSE', 'COMPLETED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "cases" (
    "id" UUID NOT NULL,
    "reference_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "case_type" TEXT NOT NULL,
    "category" TEXT,
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "CasePriority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_user_id" UUID,
    "description" TEXT,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cases_reference_number_key" ON "cases"("reference_number");

-- CreateIndex
CREATE INDEX "cases_assigned_user_id_idx" ON "cases"("assigned_user_id");

-- CreateIndex
CREATE INDEX "cases_created_by_idx" ON "cases"("created_by");

-- CreateIndex
CREATE INDEX "cases_updated_by_idx" ON "cases"("updated_by");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE INDEX "cases_priority_idx" ON "cases"("priority");

-- CreateIndex
CREATE INDEX "cases_case_type_idx" ON "cases"("case_type");

-- CreateIndex
CREATE INDEX "cases_category_idx" ON "cases"("category");

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
