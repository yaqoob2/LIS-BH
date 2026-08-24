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

export interface CaseClient {
  id: string;
  name: string;
  whatsappNumber: string;
  identityType: "CPR" | "PASSPORT";
  isActive: boolean;
}

export interface CaseNextDeadline {
  id: string;
  title: string;
  deadlineType: string;
  dueDate: string;
  status: "OPEN";
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
  clientId: string | null;

  description: string | null;

  totalFee: string | null;
  currency: string;

  createdById: string;
  updatedById: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CaseRecord extends CaseEntity {
  assignedUser: CaseUser | null;

  createdBy: CaseUser;

  client: CaseClient | null;

  nextDeadline: CaseNextDeadline | null;
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

  clientId?: string;

  totalFee?: number;

  currency?: string;
}

export type UpdateCaseRequest = Partial<CreateCaseRequest>;
