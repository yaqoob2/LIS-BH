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

export interface CaseRecord {
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

  assignedUser: CaseUser | null;
  createdBy: CaseUser;
}
