import { apiRequest } from "./client";

import type { CaseEntity, CaseRecord, CreateCaseRequest } from "../types/case";

export function getCases(): Promise<CaseRecord[]> {
  return apiRequest<CaseRecord[]>("/cases");
}

export function getCase(id: string): Promise<CaseRecord> {
  return apiRequest<CaseRecord>(`/cases/${id}`);
}

export function createCase(data: CreateCaseRequest): Promise<CaseEntity> {
  return apiRequest<CaseEntity>("/cases", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
