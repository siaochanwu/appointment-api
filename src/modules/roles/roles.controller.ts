import { Controller, Get, Post, Body, Param, Query, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/roles.dto';
import { RoleFilter } from './roles.type';
import { Role } from './entities/role.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Public()
  @Get()
  async findAll(@Query() query: RoleFilter): Promise<Role[]> {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Role | null> {
    return this.rolesService.findOne(id);
  }

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.create(createRoleDto);
  }

  @Put('id')
  async update(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role | null> {
    return this.rolesService.update(id, updateRoleDto);
  }
}
