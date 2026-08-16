CREATE SCHEMA IF NOT EXISTS extensions;

CREATE EXTENSION IF NOT EXISTS vector
WITH SCHEMA extensions;
-- CreateTable
CREATE TABLE "legal_chunks" (
    "id" UUID NOT NULL,
    "legal_resource_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "section_number" TEXT,
    "heading" TEXT,
    "page_start" INTEGER,
    "page_end" INTEGER,
    "text" TEXT NOT NULL,
    "embedding" vector(1536),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "legal_chunks_legal_resource_id_idx" ON "legal_chunks"("legal_resource_id");

-- CreateIndex
CREATE INDEX "legal_chunks_section_number_idx" ON "legal_chunks"("section_number");

-- CreateIndex
CREATE UNIQUE INDEX "legal_chunks_legal_resource_id_chunk_index_key" ON "legal_chunks"("legal_resource_id", "chunk_index");

-- AddForeignKey
ALTER TABLE "legal_chunks" ADD CONSTRAINT "legal_chunks_legal_resource_id_fkey" FOREIGN KEY ("legal_resource_id") REFERENCES "legal_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
