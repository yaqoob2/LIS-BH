import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
export declare class CasesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateCaseDto, userId: string): Promise<{
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
