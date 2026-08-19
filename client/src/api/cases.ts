import { apiRequest } from "./client";
import type { CaseRecord } from "../types/case";

export function getCases(): Promise<CaseRecord[]> {
  return apiRequest<CaseRecord[]>("/cases");
}

export function getCase(id: string): Promise<CaseRecord> {
  return apiRequest<CaseRecord>(`/cases/${id}`);
}
