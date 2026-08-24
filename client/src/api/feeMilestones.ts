import { apiRequest } from "./client";

import type {
  FeeMilestone,
  FeeMilestoneStatus,
  SaveFeeMilestonesRequest,
  SuggestFeeMilestonesResponse,
} from "../types/feeMilestone";

export function getFeeMilestones(caseId: string): Promise<FeeMilestone[]> {
  return apiRequest<FeeMilestone[]>(`/fee-milestones/case/${caseId}`);
}

export function suggestFeeMilestones(
  caseId: string,
): Promise<SuggestFeeMilestonesResponse> {
  return apiRequest<SuggestFeeMilestonesResponse>(
    `/fee-milestones/case/${caseId}/suggest`,
    {
      method: "POST",
    },
  );
}

export function saveFeeMilestones(
  caseId: string,
  data: SaveFeeMilestonesRequest,
): Promise<FeeMilestone[]> {
  return apiRequest<FeeMilestone[]>(`/fee-milestones/case/${caseId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function updateFeeMilestoneStatus(
  milestoneId: string,
  status: FeeMilestoneStatus,
): Promise<FeeMilestone> {
  return apiRequest<FeeMilestone>(`/fee-milestones/${milestoneId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
    }),
  });
}
