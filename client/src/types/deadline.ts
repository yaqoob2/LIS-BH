export type DeadlineStatus = "OPEN" | "COMPLETED" | "CANCELLED";

export interface Deadline {
  id: string;
  caseId: string;

  title: string;
  deadlineType: string;
  dueDate: string;
  status: DeadlineStatus;

  createdById: string;
  updatedById: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateDeadlineRequest {
  caseId: string;
  title: string;
  deadlineType: string;
  dueDate: string;
  status?: DeadlineStatus;
}

export interface UpdateDeadlineRequest {
  title?: string;
  deadlineType?: string;
  dueDate?: string;
  status?: DeadlineStatus;
}
