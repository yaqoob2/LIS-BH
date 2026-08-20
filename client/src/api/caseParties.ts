import { apiRequest } from "./client";

import type { CaseParty, CreateCasePartyRequest } from "../types/caseParty";

export function getCaseParties(caseId: string): Promise<CaseParty[]> {
  return apiRequest<CaseParty[]>(`/case-parties/case/${caseId}`);
}

export function createCaseParty(
  data: CreateCasePartyRequest,
): Promise<CaseParty> {
  return apiRequest<CaseParty>("/case-parties", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
