import { Request } from 'express';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
type AuthenticatedRequest = Request & {
    user: {
        sub: string;
    };
};
export declare class CasesController {
    private readonly casesService;
    constructor(casesService: CasesService);
    create(dto: CreateCaseDto, request: AuthenticatedRequest): Promise<{
        description: string | null;
        title: string;
        referenceNumber: string;
        caseType: string;
        category: string | null;
        status: import("../generated/prisma/enums").CaseStatus;
        priority: import("../generated/prisma/enums").CasePriority;
        assignedUserId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        updatedById: string | null;
    }>;
}
export {};
