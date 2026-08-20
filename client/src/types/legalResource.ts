export type ResourceProcessingStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export type ResourceStatus = "ACTIVE" | "ARCHIVED";

export interface LegalResourceUser {
  id: string;
  name: string;
  email: string;
}

export interface LegalResource {
  id: string;

  title: string;
  documentType: string;
  category: string;
  language: string;

  referenceNumber: string | null;
  year: number | null;

  processingStatus: ResourceProcessingStatus;
  resourceStatus: ResourceStatus;

  filePath: string;
  notes: string | null;
  processingError: string | null;

  createdById: string;
  updatedById: string | null;

  createdAt: string;
  updatedAt: string;

  createdBy: LegalResourceUser;
}

export interface UploadLegalResourceRequest {
  title: string;
  documentType: string;
  category: string;
  language: string;

  referenceNumber?: string;
  year?: number;
  notes?: string;

  file: File;
}

export interface ProcessLegalResourceResponse {
  resourceId: string;
  status: "READY";
  chunksEmbedded: number;
  message: string;
}
