import { RoleCode } from '../entities/role.entity';
export class CreateRoleDto {
  name: string;
  code: RoleCode;
}

export class UpdateRoleDto extends CreateRoleDto {}
