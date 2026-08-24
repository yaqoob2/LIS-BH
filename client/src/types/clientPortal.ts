import type { CaseStatus } from "./case";
import type { FeeMilestoneStatus } from "./feeMilestone";

export interface ClientPortalAccessRequest {
  token: string;
}

export interface ClientPortalAccessResponse {
  accessToken: string;

  client: {
    id: string;
    name: string;
  };
}

export interface ClientPortalMilestone {
  id: string;

  title: string;

  description: string | null;

  amount: string;

  sequence: number;

  status: FeeMilestoneStatus;

  completedAt: string | null;
}

export interface ClientPortalCase {
  id: string;

  referenceNumber: string;

  title: string;

  caseType: string;

  status: CaseStatus;

  totalFee: string | null;

  currency: string;

  progressPercentage: number;

  milestones: ClientPortalMilestone[];
}

export interface ClientPortalData {
  client: {
    id: string;
    name: string;
  };

  cases: ClientPortalCase[];
}
