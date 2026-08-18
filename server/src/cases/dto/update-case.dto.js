"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCaseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_case_dto_1 = require("./create-case.dto");
class UpdateCaseDto extends (0, swagger_1.PartialType)(create_case_dto_1.CreateCaseDto) {
}
exports.UpdateCaseDto = UpdateCaseDto;
//# sourceMappingURL=update-case.dto.js.map