import { apiRequest } from "./client";

import type {
  LegalResource,
  ProcessLegalResourceResponse,
  UploadLegalResourceRequest,
} from "../types/legalResource";

export function getLegalResources(): Promise<LegalResource[]> {
  return apiRequest<LegalResource[]>("/legal-resources");
}

export function uploadLegalResource(
  data: UploadLegalResourceRequest,
): Promise<LegalResource> {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("documentType", data.documentType);
  formData.append("category", data.category);
  formData.append("language", data.language);

  if (data.referenceNumber) {
    formData.append("referenceNumber", data.referenceNumber);
  }

  if (data.year !== undefined) {
    formData.append("year", String(data.year));
  }

  if (data.notes) {
    formData.append("notes", data.notes);
  }

  formData.append("file", data.file);

  return apiRequest<LegalResource>("/legal-resources", {
    method: "POST",
    body: formData,
  });
}

export function processLegalResource(
  id: string,
): Promise<ProcessLegalResourceResponse> {
  return apiRequest<ProcessLegalResourceResponse>(
    `/legal-resources/${id}/process`,
    {
      method: "POST",
    },
  );
}
