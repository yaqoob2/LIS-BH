import { apiRequest } from "./client";

import type {
  CreateDeadlineRequest,
  Deadline,
  UpdateDeadlineRequest,
} from "../types/deadline";

export function getCaseDeadlines(caseId: string): Promise<Deadline[]> {
  return apiRequest<Deadline[]>(`/deadlines/case/${caseId}`);
}

export function createDeadline(data: CreateDeadlineRequest): Promise<Deadline> {
  return apiRequest<Deadline>("/deadlines", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateDeadline(
  id: string,
  data: UpdateDeadlineRequest,
): Promise<Deadline> {
  return apiRequest<Deadline>(`/deadlines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteDeadline(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/deadlines/${id}`, {
    method: "DELETE",
  });
}
