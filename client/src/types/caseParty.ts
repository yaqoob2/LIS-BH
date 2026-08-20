export type PartyType = "PERSON" | "COMPANY" | "GOVERNMENT" | "OTHER";

export interface CaseParty {
  id: string;
  caseId: string;
  name: string;
  partyType: PartyType;
  roleInCase: string;
  notes: string | null;
  createdById: string;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCasePartyRequest {
  caseId: string;
  name: string;
  partyType: PartyType;
  roleInCase: string;
  notes?: string;
}
