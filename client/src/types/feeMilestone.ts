export type FeeMilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface FeeMilestone {
  id: string;

  caseId: string;

  title: string;

  description: string | null;

  amount: string;

  sequence: number;

  status: FeeMilestoneStatus;

  completedAt: string | null;

  createdById: string;

  updatedById: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface SuggestedFeeMilestone {
  sequence: number;

  title: string;

  description: string | null;

  amount: string;
}

export interface SuggestFeeMilestonesResponse {
  caseId: string;

  referenceNumber: string;

  totalFee: string;

  currency: string;

  milestones: SuggestedFeeMilestone[];
}

export interface SaveFeeMilestoneItem {
  title: string;

  description?: string;

  amount: string;
}

export interface SaveFeeMilestonesRequest {
  milestones: SaveFeeMilestoneItem[];
}

export interface UpdateFeeMilestoneStatusRequest {
  status: FeeMilestoneStatus;
}
