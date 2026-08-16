-- CreateEnum
CREATE TYPE "DocumentProcessingStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "case_documents" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "extracted_text" TEXT,
    "processing_status" "DocumentProcessingStatus" NOT NULL DEFAULT 'UPLOADED',
    "processing_error" TEXT,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "case_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "case_documents_case_id_idx" ON "case_documents"("case_id");

-- CreateIndex
CREATE INDEX "case_documents_document_type_idx" ON "case_documents"("document_type");

-- CreateIndex
CREATE INDEX "case_documents_processing_status_idx" ON "case_documents"("processing_status");

-- CreateIndex
CREATE INDEX "case_documents_created_by_idx" ON "case_documents"("created_by");

-- CreateIndex
CREATE INDEX "case_documents_updated_by_idx" ON "case_documents"("updated_by");

-- AddForeignKey
ALTER TABLE "case_documents" ADD CONSTRAINT "case_documents_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_documents" ADD CONSTRAINT "case_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_documents" ADD CONSTRAINT "case_documents_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
