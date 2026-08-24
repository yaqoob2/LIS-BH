import { apiRequest } from "./client";

import type {
  CaseRecord,
  CreateCaseRequest,
  UpdateCaseRequest,
} from "../types/case";

export function getCases(): Promise<CaseRecord[]> {
  return apiRequest<CaseRecord[]>("/cases");
}

export function getCase(id: string): Promise<CaseRecord> {
  return apiRequest<CaseRecord>(`/cases/${id}`);
}

export function createCase(data: CreateCaseRequest): Promise<CaseRecord> {
  return apiRequest<CaseRecord>("/cases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCase(
  id: string,
  data: UpdateCaseRequest,
): Promise<CaseRecord> {
  return apiRequest<CaseRecord>(`/cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
