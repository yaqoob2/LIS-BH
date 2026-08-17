import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'List all internal users',
  })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({
    summary: 'Create a new internal user',
  })
  @Post()
  create(@Body() dto: CreateUserDto, @Req() request: AuthenticatedRequest) {
    return this.usersService.create(dto, request.user.sub);
  }

  @ApiOperation({
    summary: 'Update, activate or deactivate a user',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.update(id, dto, request.user.sub);
  }
}
