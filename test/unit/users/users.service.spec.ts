import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from 'src/modules/users/dto/users.dto';
import { UserFilter } from 'src/modules/users/users.type';
import { RoleCode } from 'src/modules/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/modules/userRoles/entities/userRole.entity';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  // Mock 數據
  const mockUser: User = {
    id: 1,
    name: 'John',
    code: 'USER001',
    email: 'john@example.com',
    password: 'hashedPassword123',
    isActive: true,
    userRoles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDoctorUser: User = {
    id: 2,
    name: 'Dr. Smith',
    code: 'DOC001',
    email: 'dr.smith@example.com',
    password: 'hashedPassword456',
    isActive: true,
    userRoles: [
      {
        id: 1,
        userId: 2,
        roleId: 1,
        user: mockUser,
        role: {
          id: 1,
          name: 'Doctor',
          code: RoleCode.DOCTOR,
          userRoles: [],
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        deleted: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateUserDto: CreateUserDto = {
    name: 'John',
    code: 'USER001',
    email: 'john@example.com',
    password: 'plainPassword123',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    name: 'John junior',
    email: 'john@example.com',
  };

  const mockUpdateUserDtoWithPassword: UpdateUserDto = {
    name: 'John junior',
    email: 'john@example.com',
    password: 'newPlainPassword',
  };

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;

    // 清除所有 mock
    jest.clearAllMocks();
  });

  it('should be define', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users without filters', async () => {
      const query: UserFilter = {};
      repository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual([mockUser]);
    });

    it('should return users with id filters', async () => {
      const query: UserFilter = { id: 1 };
      repository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual([mockUser]);
    });

    it('should return users with name filters', async () => {
      const query: UserFilter = { name: 'John' };
      repository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          name: 'John',
        },
      });
      expect(result).toEqual([mockUser]);
    });

    it('should return users with code filters', async () => {
      const query: UserFilter = { code: 'USER001' };
      repository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          code: 'USER001',
        },
      });
      expect(result).toEqual([mockUser]);
    });

    it('should return users with email filters', async () => {
      const query: UserFilter = { email: 'john@example.com' };
      repository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          email: 'john@example.com',
        },
      });
      expect(result).toEqual([mockUser]);
    });

    it('should return users with multiple filters', async () => {
      const query: UserFilter = {
        id: 1,
        name: 'John',
        code: 'USER001',
        email: 'john@example.com',
      };
      repository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          id: 1,
          name: 'John',
          code: 'USER001',
          email: 'john@example.com',
        },
      });
      expect(result).toEqual([mockUser]);
    });

    it('should return empty array when no user found', async () => {
      const query: UserFilter = { id: 999 };
      repository.find.mockResolvedValue([]);

      const result = await service.findAll(query);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          id: 999,
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBeNull();
    });
  });

  describe('findOneByName', () => {
    it('should return a user when found by name', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByName('John');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: 'John' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by name', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findOneByName('pokemon');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          name: 'pokemon',
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const salt = 'mockSalt';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.genSalt.mockResolvedValue(salt as never);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      repository.save.mockResolvedValue({
        ...mockCreateUserDto,
        password: hashedPassword,
        id: 1,
        isActive: true,
        userRoles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(mockCreateUserDto);

      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('plainPassword123', salt);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: hashedPassword,
      });
      expect(result.password).toBe(hashedPassword);
    });

    it('should handle bcrypt errors', async () => {
      const error = new Error('bcrypt error');
      mockBcrypt.genSalt.mockRejectedValue(error as never);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        'bcrypt error',
      );
    });
  });

  describe('update', () => {
    it('should update without password', async () => {
      const updatedUser = { ...mockUser, ...mockUpdateUserDto };

      repository.update.mockResolvedValue({
        affected: 1,
        generatedMaps: [],
        raw: [],
      });
      repository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(1, mockUpdateUserDto);

      expect(repository.update).toHaveBeenCalledWith(1, mockUpdateUserDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(updatedUser);
      expect(mockBcrypt.genSalt).not.toHaveBeenCalled();
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
    });

    it('should update with hashed password', async () => {
      const salt = 'mockSalt';
      const hashedPassword = 'hashedPassword123';

      const updatedUser = {
        ...mockUser,
        ...mockUpdateUserDtoWithPassword,
        password: hashedPassword,
      };

      mockBcrypt.genSalt.mockResolvedValue(salt as never);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      repository.update.mockResolvedValue({
        affected: 1,
        generatedMaps: [],
        raw: [],
      });
      repository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(1, mockUpdateUserDtoWithPassword);

      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('newPlainPassword', salt);
      expect(repository.update).toHaveBeenCalledWith(1, {
        ...mockUpdateUserDtoWithPassword,
        password: hashedPassword,
      });
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(updatedUser);
    });

    it('should return null when user not found', async () => {
      repository.update.mockResolvedValue({
        affected: 1,
        generatedMaps: [],
        raw: [],
      });
      repository.findOne.mockResolvedValue(null);

      const result = await service.update(1, mockCreateUserDto);

      expect(result).toBeNull();
    });

    it('should handle bcrypt error during update', async () => {
      const error = new Error('bcrypt error');
      mockBcrypt.genSalt.mockRejectedValue(error as never);

      await expect(
        service.update(1, mockUpdateUserDtoWithPassword),
      ).rejects.toThrow('bcrypt error');
    });
  });

  describe('getDoctors', () => {
    it('should return active doctors', async () => {
      const mockDoctors = [
        {
          id: mockDoctorUser.id,
          code: mockDoctorUser.code,
          name: mockDoctorUser.name,
        },
      ];

      repository.find.mockResolvedValue(mockDoctors as User[]);

      const result = await service.getDoctors();

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          isActive: true,
          userRoles: {
            role: {
              code: RoleCode.DOCTOR,
            },
          },
        },
        select: ['id', 'name', 'code'],
      });
      expect(result).toEqual(mockDoctors);
    });

    it('should return empty array when no active doctors found', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.getDoctors();

      expect(result).toEqual([]);
    });

    it('should handle repository error', async () => {
      const error = new Error('Database error');

      repository.find.mockRejectedValue(error as never);

      await expect(service.getDoctors()).rejects.toThrow('Database error');
    });
  });

  describe('error handling', () => {
    it('should handle repository errors in findAll', async () => {
      const error = new Error('Database error');
      repository.find.mockRejectedValue(error as never);

      await expect(service.findAll({})).rejects.toThrow('Database error');
    });

    it('should handle repository errors in findOne', async () => {
      const error = new Error('Database error');
      repository.findOne.mockRejectedValue(error as never);

      await expect(service.findOne(1)).rejects.toThrow('Database error');
    });

    it('should handle repository errors in findOneByName', async () => {
      const error = new Error('Database error');
      repository.findOne.mockRejectedValue(error as never);

      await expect(service.findOneByName('John')).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle repository errors in create', async () => {
      const salt = 'mockSalt';
      const hashedPassword = 'hashedPassword123';

      mockBcrypt.genSalt.mockResolvedValue(salt as never);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const error = new Error('Database error');
      repository.save.mockRejectedValue(error as never);

      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle repository errors in update', async () => {
      const error = new Error('Database error');
      repository.update.mockRejectedValue(error as never);

      await expect(service.update(1, mockUpdateUserDto)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
