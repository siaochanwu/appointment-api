import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/userRole.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRolesFilter } from './userRoles.type';
import { CreateUserRolesDto } from './dto/userRoles.dto';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRolesRepository: Repository<UserRole>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async findAll(query: UserRolesFilter): Promise<UserRole[]> {
    const where: any = {};
    if (query.id) {
      where.id = query.id;
    }
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.roleId) {
      where.roleId = query.roleId;
    }
    return this.userRolesRepository.find({
      where,
      relations: ['user', 'role'],
    });
  }

  async findOne(id: number): Promise<UserRole | null> {
    return this.userRolesRepository.findOne({
      where: { id },
      relations: ['user', 'role'],
    });
  }

  async create(createUserRoleDto: CreateUserRolesDto): Promise<UserRole> {
    const { userId, roleId } = createUserRoleDto;
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // 驗證 Role 是否存在
    const role = await this.rolesRepository.findOne({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    const existingUserRole = await this.userRolesRepository.findOne({
      where: {
        user: { id: userId },
        role: { id: roleId },
        deleted: false,
      },
    });

    if (existingUserRole) {
      throw new ConflictException(`User ${userId} already has role ${roleId}`);
    }

    const userRole = this.userRolesRepository.create({
      user,
      role,
    });

    return await this.userRolesRepository.save(userRole);
  }
}
