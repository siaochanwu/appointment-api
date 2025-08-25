import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { RoleFilter } from './roles.type';
import { CreateRoleDto, UpdateRoleDto } from './dto/roles.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async findAll(query: RoleFilter): Promise<Role[]> {
    const where: FindOptionsWhere<Role> = {};
    if (query.id) {
      where.id = query.id;
    }
    if (query.name) {
      where.name = query.name;
    }
    if (query.code) {
      where.code = query.code;
    }
    return this.rolesRepository.find({ where });
  }

  async findOne(id: number): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { id } });
  }

  async findOneByCode(code: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { code } });
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesRepository.save(createRoleDto);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    await this.rolesRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }
}
