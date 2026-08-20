export type DocumentProcessingStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export interface CaseDocument {
  id: string;
  caseId: string;

  title: string;
  documentType: string;
  filePath: string;

  extractedText: string | null;
  processingStatus: DocumentProcessingStatus;
  processingError: string | null;

  createdById: string;
  updatedById: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface UploadCaseDocumentRequest {
  caseId: string;
  title: string;
  documentType: string;
  file: File;
}
