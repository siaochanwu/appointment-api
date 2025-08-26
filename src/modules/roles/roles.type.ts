import { RoleCode } from './entities/role.entity';
export interface RoleFilter {
  id?: number;
  name?: string;
  code?: RoleCode;
}
