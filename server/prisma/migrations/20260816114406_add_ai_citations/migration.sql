-- CreateTable
CREATE TABLE "ai_citations" (
    "id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "legal_chunk_id" UUID NOT NULL,

    CONSTRAINT "ai_citations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_citations_message_id_idx" ON "ai_citations"("message_id");

-- CreateIndex
CREATE INDEX "ai_citations_legal_chunk_id_idx" ON "ai_citations"("legal_chunk_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_citations_message_id_legal_chunk_id_key" ON "ai_citations"("message_id", "legal_chunk_id");

-- AddForeignKey
ALTER TABLE "ai_citations" ADD CONSTRAINT "ai_citations_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ai_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_citations" ADD CONSTRAINT "ai_citations_legal_chunk_id_fkey" FOREIGN KEY ("legal_chunk_id") REFERENCES "legal_chunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
