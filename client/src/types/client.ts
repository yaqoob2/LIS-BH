import type { CasePriority, CaseStatus } from "./case";

export type ClientIdentityType = "CPR" | "PASSPORT";

export interface Client {
  id: string;

  name: string;

  whatsappNumber: string;

  identityType: ClientIdentityType;

  identityNumberMasked: string;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;

  whatsappNumber: string;

  identityType: ClientIdentityType;

  identityNumber: string;
}

export interface CreateClientResponse {
  reused: boolean;

  client: Client;
}

export interface UpdateClientRequest {
  name?: string;

  whatsappNumber?: string;

  identityType?: ClientIdentityType;

  identityNumber?: string;

  isActive?: boolean;
}

export interface ClientCaseSummary {
  id: string;

  referenceNumber: string;

  title: string;

  caseType: string;

  status: CaseStatus;

  priority: CasePriority;

  totalFee: string | null;

  currency: string;

  createdAt: string;
}

export interface ClientWithCases extends Client {
  cases: ClientCaseSummary[];
}
