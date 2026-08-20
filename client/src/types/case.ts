export type CaseStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "AWAITING_RESPONSE"
  | "COMPLETED"
  | "CLOSED";

export type CasePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CaseUser {
  id: string;
  name: string;
  email: string;
}

export interface CaseEntity {
  id: string;
  referenceNumber: string;
  title: string;
  caseType: string;
  category: string | null;
  status: CaseStatus;
  priority: CasePriority;
  assignedUserId: string | null;
  description: string | null;
  createdById: string;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaseRecord extends CaseEntity {
  assignedUser: CaseUser | null;
  createdBy: CaseUser;
}

export interface CreateCaseRequest {
  referenceNumber: string;
  title: string;
  caseType: string;
  category?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  description?: string;
  assignedUserId?: string;
}
