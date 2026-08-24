-- CreateEnum
CREATE TYPE "ClientIdentityType" AS ENUM ('CPR', 'PASSPORT');

-- CreateEnum
CREATE TYPE "FeeMilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "client_id" UUID,
ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'BHD',
ADD COLUMN     "total_fee" DECIMAL(12,3);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "whatsapp_number" TEXT NOT NULL,
    "identity_type" "ClientIdentityType" NOT NULL,
    "identity_number_encrypted" TEXT NOT NULL,
    "identity_number_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_portal_tokens" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_portal_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_milestones" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,3) NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" "FeeMilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_identity_number_hash_key" ON "clients"("identity_number_hash");

-- CreateIndex
CREATE INDEX "clients_whatsapp_number_idx" ON "clients"("whatsapp_number");

-- CreateIndex
CREATE UNIQUE INDEX "client_portal_tokens_token_hash_key" ON "client_portal_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "client_portal_tokens_client_id_idx" ON "client_portal_tokens"("client_id");

-- CreateIndex
CREATE INDEX "client_portal_tokens_expires_at_idx" ON "client_portal_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "fee_milestones_case_id_idx" ON "fee_milestones"("case_id");

-- CreateIndex
CREATE INDEX "fee_milestones_status_idx" ON "fee_milestones"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fee_milestones_case_id_sequence_key" ON "fee_milestones"("case_id", "sequence");

-- CreateIndex
CREATE INDEX "cases_client_id_idx" ON "cases"("client_id");

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_portal_tokens" ADD CONSTRAINT "client_portal_tokens_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_milestones" ADD CONSTRAINT "fee_milestones_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_milestones" ADD CONSTRAINT "fee_milestones_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_milestones" ADD CONSTRAINT "fee_milestones_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
