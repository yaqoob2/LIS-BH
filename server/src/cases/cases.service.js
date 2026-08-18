"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CasesService = class CasesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const existing = await this.prisma.case.findUnique({
            where: {
                referenceNumber: dto.referenceNumber.trim(),
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Case reference number already exists');
        }
        if (dto.assignedUserId) {
            const assignedUser = await this.prisma.user.findUnique({
                where: {
                    id: dto.assignedUserId,
                },
            });
            if (!assignedUser || !assignedUser.isActive) {
                throw new common_1.BadRequestException('Assigned user is invalid or inactive');
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const newCase = await tx.case.create({
                data: {
                    referenceNumber: dto.referenceNumber.trim(),
                    title: dto.title.trim(),
                    caseType: dto.caseType.trim(),
                    category: dto.category?.trim() || null,
                    status: dto.status,
                    priority: dto.priority,
                    description: dto.description?.trim() || null,
                    assignedUserId: dto.assignedUserId || null,
                    createdById: userId,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'CASE_CREATED',
                    entityType: 'CASE',
                    entityId: newCase.id,
                },
            });
            return newCase;
        });
    }
};
exports.CasesService = CasesService;
exports.CasesService = CasesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CasesService);
//# sourceMappingURL=cases.service.js.map