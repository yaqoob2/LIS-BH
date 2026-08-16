-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('PERSON', 'COMPANY', 'GOVERNMENT', 'OTHER');

-- CreateTable
CREATE TABLE "case_parties" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "party_type" "PartyType" NOT NULL,
    "role_in_case" TEXT NOT NULL,
    "notes" TEXT,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_parties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "case_parties_case_id_idx" ON "case_parties"("case_id");

-- CreateIndex
CREATE INDEX "case_parties_party_type_idx" ON "case_parties"("party_type");

-- CreateIndex
CREATE INDEX "case_parties_created_by_idx" ON "case_parties"("created_by");

-- CreateIndex
CREATE INDEX "case_parties_updated_by_idx" ON "case_parties"("updated_by");

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
