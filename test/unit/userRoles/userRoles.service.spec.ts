import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserRolesService } from 'src/modules/userRoles/userRoles.service';
import { UserRole } from 'src/modules/userRoles/entities/userRole.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Role, RoleCode } from 'src/modules/roles/entities/role.entity';
import { CreateUserRolesDto } from 'src/modules/userRoles/dto/userRoles.dto';
import { UserRolesFilter } from 'src/modules/userRoles/userRoles.type';
import { relative } from 'path';

describe('UserRolesService', () => {
  let service: UserRolesService;
  let userRolesRepository: jest.Mocked<Repository<UserRole>>;
  let usersRepository: jest.Mocked<Repository<User>>;
  let rolesRepository: jest.Mocked<Repository<Role>>;

  // Mock data
  const mockUser: User = {
    id: 1,
    name: 'Test User',
    code: 'USER001',
    email: 'test@example.com',
    password: 'hashedPassword',
    isActive: true,
    userRoles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRole: Role = {
    id: 1,
    name: 'Admin',
    code: RoleCode.ADMIN,
    deleted: false,
    userRoles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRole: UserRole = {
    id: 1,
    userId: 1,
    roleId: 1,
    user: mockUser,
    role: mockRole,
    deleted: false,
  };

  const mockCreateUserRoleDto: CreateUserRolesDto = {
    userId: 1,
    roleId: 1,
  };

  beforeEach(async () => {
    const mockUserRolesRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockUsersRepository = {
      findOne: jest.fn(),
    };

    const mockRolesRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRolesService,
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRolesRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRolesRepository,
        },
      ],
    }).compile();

    service = module.get<UserRolesService>(UserRolesService);
    userRolesRepository = module.get<Repository<UserRole>>(
      getRepositoryToken(UserRole),
    ) as jest.Mocked<Repository<UserRole>>;
    usersRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
    rolesRepository = module.get<Repository<Role>>(
      getRepositoryToken(Role),
    ) as jest.Mocked<Repository<Role>>;

    // 清除所有 mock
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return user roles without filters', async () => {
      const query: UserRolesFilter = {};
      userRolesRepository.find.mockResolvedValue([mockUserRole]);

      const result = await service.findAll(query);

      expect(userRolesRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['user', 'role'],
      });
      expect(result).toEqual([mockUserRole]);
    });

    it('should return user roles with id filter', async () => {
      const query: UserRolesFilter = { id: 1 };
      userRolesRepository.find.mockResolvedValue([mockUserRole]);

      const result = await service.findAll(query);

      expect(userRolesRepository.find).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user', 'role'],
      });
      expect(result).toEqual([mockUserRole]);
    });

    it('should return user roles with userId filter', async () => {
      const query: UserRolesFilter = { userId: 1 };
      userRolesRepository.find.mockResolvedValue([mockUserRole]);

      const result = await service.findAll(query);

      expect(userRolesRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['user', 'role'],
      });
      expect(result).toEqual([mockUserRole]);
    });

    it('should return user roles with roleId filter', async () => {
      const query: UserRolesFilter = { roleId: 1 };
      userRolesRepository.find.mockResolvedValue([mockUserRole]);

      const result = await service.findAll(query);

      expect(userRolesRepository.find).toHaveBeenCalledWith({
        where: { roleId: 1 },
        relations: ['user', 'role'],
      });
      expect(result).toEqual([mockUserRole]);
    });

    it('should return user roles with multiple filters', async () => {
      const query: UserRolesFilter = {
        userId: 1,
        roleId: 1,
      };
      userRolesRepository.find.mockResolvedValue([mockUserRole]);

      const result = await service.findAll(query);

      expect(userRolesRepository.find).toHaveBeenCalledWith({
        where: {
          userId: 1,
          roleId: 1,
        },
        relations: ['user', 'role'],
      });
      expect(result).toEqual([mockUserRole]);
    });

    it('should reurn an empty array when no user roles found', async () => {
      const query: UserRolesFilter = { id: 999 };
      userRolesRepository.find.mockResolvedValue([]);

      const result = await service.findAll(query);

      expect(userRolesRepository.find).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['user', 'role'],
      });
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      const query: UserRolesFilter = {};
      const error = new Error('Database error');
      userRolesRepository.find.mockRejectedValue(error);

      await expect(service.findAll(query)).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a user role when found', async () => {
      const id = 1;
      userRolesRepository.findOne.mockResolvedValue(mockUserRole);

      const result = await service.findOne(id);

      expect(userRolesRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['user', 'role'],
      });
      expect(result).toEqual(mockUserRole);
    });

    it('should return null when user role not found', async () => {
      const id = 999;
      userRolesRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(id);

      expect(userRolesRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['user', 'role'],
      });
      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      const id = 1;
      const error = new Error('Database error');
      userRolesRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne(id)).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create a user role', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);
      rolesRepository.findOne.mockResolvedValue(mockRole);
      userRolesRepository.findOne.mockResolvedValue(null);
      userRolesRepository.create.mockReturnValue(mockUserRole);
      userRolesRepository.save.mockResolvedValue(mockUserRole);

      const result = await service.create(mockCreateUserRoleDto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreateUserRoleDto.userId },
      });
      expect(rolesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreateUserRoleDto.roleId },
      });
      expect(userRolesRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: mockCreateUserRoleDto.userId },
          role: { id: mockCreateUserRoleDto.roleId },
          deleted: false,
        },
      });
      expect(userRolesRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        role: mockRole,
      });
      expect(userRolesRepository.save).toHaveBeenCalledWith(mockUserRole);
      expect(result).toEqual(mockUserRole);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 999;
      const createDto: CreateUserRolesDto = { userId, roleId: 1 };
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(rolesRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when role not found', async () => {
      const roleId = 999;
      const createDto: CreateUserRolesDto = { userId: 1, roleId };
      usersRepository.findOne.mockResolvedValue(mockUser);
      rolesRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new NotFoundException(`Role with ID ${roleId} not found`),
      );

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(rolesRepository.findOne).toHaveBeenCalledWith({
        where: { id: roleId },
      });
      expect(userRolesRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when user role already exist', async () => {
      const existingUserRole = { ...mockUserRole, deleted: false };
      usersRepository.findOne.mockResolvedValue(mockUser);
      rolesRepository.findOne.mockResolvedValue(mockRole);
      userRolesRepository.findOne.mockResolvedValue(existingUserRole);

      await expect(service.create(mockCreateUserRoleDto)).rejects.toThrow(
        new ConflictException(
          `User ${mockCreateUserRoleDto.userId} already has role ${mockCreateUserRoleDto.roleId}`,
        ),
      );

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreateUserRoleDto.userId },
      });
      expect(rolesRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreateUserRoleDto.roleId },
      });
      expect(userRolesRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: mockCreateUserRoleDto.userId },
          role: { id: mockCreateUserRoleDto.roleId },
          deleted: false,
        },
      });
      expect(userRolesRepository.create).not.toHaveBeenCalled();
      expect(userRolesRepository.save).not.toHaveBeenCalled();
    });

    it('should handle different user and role combinations', async () => {
      const anotherUser: User = { ...mockUser, id: 2, name: 'Another User' };
      const anotherRole: Role = { ...mockRole, id: 2, name: 'Doctor' };
      const createDto: CreateUserRolesDto = { userId: 2, roleId: 2 };
      const expectedUserRole = {
        ...mockUserRole,
        id: 2,
        userid: 2,
        roleId: 2,
        user: anotherUser,
        role: anotherRole,
      };

      usersRepository.findOne.mockResolvedValue(anotherUser);
      rolesRepository.findOne.mockResolvedValue(anotherRole);
      userRolesRepository.findOne.mockResolvedValue(null);
      userRolesRepository.create.mockReturnValue(expectedUserRole);
      userRolesRepository.save.mockResolvedValue(expectedUserRole);

      const result = await service.create(createDto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(rolesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(userRolesRepository.create).toHaveBeenCalledWith({
        user: anotherUser,
        role: anotherRole,
      });
      expect(result).toEqual(expectedUserRole);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Save failed');
      usersRepository.findOne.mockResolvedValue(mockUser);
      rolesRepository.findOne.mockResolvedValue(mockRole);
      userRolesRepository.findOne.mockResolvedValue(null);
      userRolesRepository.create.mockReturnValue(mockUserRole);
      userRolesRepository.save.mockRejectedValue(error);

      await expect(service.create(mockCreateUserRoleDto)).rejects.toThrow(
        'Save failed',
      );
    });

    it('should handle repository errors during role lookup', async () => {
      const error = new Error('Database error');
      usersRepository.findOne.mockResolvedValue(mockUser);
      rolesRepository.findOne.mockRejectedValue(error);

      await expect(service.create(mockCreateUserRoleDto)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
