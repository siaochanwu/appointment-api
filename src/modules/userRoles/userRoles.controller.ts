import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserRolesService } from './userRoles.service';
import { UserRolesFilter } from './userRoles.type';
import { CreateUserRolesDto } from './dto/userRoles.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Get()
  findAll(@Query() query: UserRolesFilter) {
    return this.userRolesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userRolesService.findOne(id);
  }

  @Public()
  @Post()
  create(@Body() createUserRoleDto: CreateUserRolesDto) {
    return this.userRolesService.create(createUserRoleDto);
  }
}
