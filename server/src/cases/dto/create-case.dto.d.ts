import { CasePriority, CaseStatus } from '../../generated/prisma/client';
export declare class CreateCaseDto {
    referenceNumber: string;
    title: string;
    caseType: string;
    category?: string;
    status?: CaseStatus;
    priority?: CasePriority;
    description?: string;
    assignedUserId?: string;
}
