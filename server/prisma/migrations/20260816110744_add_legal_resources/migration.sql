-- CreateEnum
CREATE TYPE "ResourceProcessingStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "legal_resources" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "reference_number" TEXT,
    "year" INTEGER,
    "processing_status" "ResourceProcessingStatus" NOT NULL DEFAULT 'UPLOADED',
    "resource_status" "ResourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "file_path" TEXT NOT NULL,
    "notes" TEXT,
    "processing_error" TEXT,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "legal_resources_created_by_idx" ON "legal_resources"("created_by");

-- CreateIndex
CREATE INDEX "legal_resources_updated_by_idx" ON "legal_resources"("updated_by");

-- CreateIndex
CREATE INDEX "legal_resources_processing_status_idx" ON "legal_resources"("processing_status");

-- CreateIndex
CREATE INDEX "legal_resources_resource_status_idx" ON "legal_resources"("resource_status");

-- CreateIndex
CREATE INDEX "legal_resources_category_idx" ON "legal_resources"("category");

-- CreateIndex
CREATE INDEX "legal_resources_document_type_idx" ON "legal_resources"("document_type");

-- AddForeignKey
ALTER TABLE "legal_resources" ADD CONSTRAINT "legal_resources_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_resources" ADD CONSTRAINT "legal_resources_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
