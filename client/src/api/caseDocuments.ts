import { apiRequest } from "./client";

import { clearAccessToken, getAccessToken } from "../auth/token";

import type {
  CaseDocument,
  UploadCaseDocumentRequest,
} from "../types/caseDocument";

const API_URL = import.meta.env.VITE_API_URL;

export function getCaseDocuments(caseId: string): Promise<CaseDocument[]> {
  return apiRequest<CaseDocument[]>(`/case-documents/case/${caseId}`);
}

export function uploadCaseDocument(
  data: UploadCaseDocumentRequest,
): Promise<CaseDocument> {
  const formData = new FormData();

  formData.append("caseId", data.caseId);
  formData.append("title", data.title);
  formData.append("documentType", data.documentType);
  formData.append("file", data.file);

  return apiRequest<CaseDocument>("/case-documents", {
    method: "POST",
    body: formData,
  });
}

export function processCaseDocument(id: string): Promise<CaseDocument> {
  return apiRequest<CaseDocument>(`/case-documents/${id}/process`, {
    method: "POST",
  });
}

export function deleteCaseDocument(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/case-documents/${id}`, {
    method: "DELETE",
  });
}

export async function downloadCaseDocument(
  document: CaseDocument,
): Promise<void> {
  const token = getAccessToken();

  const response = await fetch(
    `${API_URL}/case-documents/${document.id}/download`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    },
  );

  if (response.status === 401) {
    clearAccessToken();

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    throw new Error("Your session has expired.");
  }

  if (!response.ok) {
    let message = "Unable to download document.";

    try {
      const data = await response.json();

      if (typeof data?.message === "string") {
        message = data.message;
      } else if (Array.isArray(data?.message)) {
        message = data.message[0] ?? message;
      }
    } catch {
      // Keep fallback message
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  const extension = document.filePath.toLowerCase().endsWith(".pdf")
    ? "pdf"
    : "docx";

  const url = URL.createObjectURL(blob);

  const link = window.document.createElement("a");

  link.href = url;
  link.download = `${document.title}.${extension}`;

  window.document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
