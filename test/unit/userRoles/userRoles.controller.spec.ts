import { Test, TestingModule } from '@nestjs/testing';
import { UserRolesController } from 'src/modules/userRoles/userRoles.controller';
import { UserRolesService } from 'src/modules/userRoles/userRoles.service';
import { CreateUserRolesDto } from 'src/modules/userRoles/dto/userRoles.dto';
import { UserRolesFilter } from 'src/modules/userRoles/userRoles.type';
import { UserRole } from 'src/modules/userRoles/entities/userRole.entity';
import { RoleCode } from 'src/modules/roles/entities/role.entity';

describe('UserRolesController', () => {
  let controller: UserRolesController;
  let service: jest.Mocked<UserRolesService>;

  // Mock data
  const mockUserRole: UserRole = {
    id: 1,
    userId: 1,
    roleId: 1,
    user: {
      id: 1,
      name: 'Test User',
      code: 'USER001',
      email: 'test@example.com',
      password: 'hashedPassword',
      isActive: true,
      userRoles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    role: {
      id: 1,
      name: 'Admin',
      code: RoleCode.ADMIN,
      deleted: false,
      userRoles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    deleted: false,
  };

  const mockUserRoles = [mockUserRole];
  const mockCreateUserDto: CreateUserRolesDto = {
    userId: 1,
    roleId: 1,
  };

  beforeEach(async () => {
    const mockUserRolesService = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserRolesController],
      providers: [
        {
          provide: UserRolesService,
          useValue: mockUserRolesService,
        },
      ],
    }).compile();

    controller = module.get<UserRolesController>(UserRolesController);
    service = module.get<UserRolesService>(
      UserRolesService,
    ) as jest.Mocked<UserRolesService>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /user-roles findAll', () => {
    it('should call service.findAll with query params', async () => {
      const query: UserRolesFilter = { userId: 1, roleId: 1 };
      service.findAll.mockResolvedValue(mockUserRoles);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserRoles);
    });

    it('should call service.findAll with empty query', async () => {
      const query: UserRolesFilter = {};
      service.findAll.mockResolvedValue(mockUserRoles);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should handle query with id filter', async () => {
      const query: UserRolesFilter = { id: 1 };
      service.findAll.mockResolvedValue([mockUserRole]);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual([mockUserRole]);
    });

    it('should handle query with userId filter', async () => {
      const query: UserRolesFilter = { userId: 2 };
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({ userId: 2 });
      expect(result).toEqual([]);
    });

    it('should propagate service error', async () => {
      const query: UserRolesFilter = {};
      const error = new Error('Service error');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll(query)).rejects.toThrow(error);
    });
  });

  describe('GET /user-roles/:id findOne', () => {
    it('should call service.finOne with correct id param', async () => {
      const id = 1;
      service.findOne.mockResolvedValue(mockUserRole);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockUserRole);
    });

    it('should handle id not found', async () => {
      const id = 999;
      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });

    it('should propagate service error', async () => {
      const id = 1;
      const error = new Error('Service error');
      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne(id)).rejects.toThrow('Service error');
    });
  });

  describe('POST /user-roles create', () => {
    it('should call service.create with request body', async () => {
      service.create.mockResolvedValue(mockUserRole);

      const result = await controller.create(mockCreateUserDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockUserRole);
    });

    it('should handle empty request body', async () => {
      const emptyDto = {} as CreateUserRolesDto;
      service.create.mockResolvedValue(mockUserRole);

      await controller.create(emptyDto);

      expect(service.create).toHaveBeenCalledWith(emptyDto);
    });

    it('should propagate service error', async () => {
      const error = new Error('Service error');
      service.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(error);
    });
  });

  describe('HTTP decorator behavior', () => {
    it('should handle @Query() decorator with multiple params', async () => {
      const complexQuery: UserRolesFilter = {
        id: 1,
        userId: 2,
        roleId: 3,
      };
      service.findAll.mockResolvedValue(mockUserRoles);

      const result = await controller.findAll(complexQuery);

      expect(service.findAll).toHaveBeenCalledWith(complexQuery);
    });

    it('should handle @Params() decorator for id extraction', async () => {
      const pathId = 42;
      service.findOne.mockResolvedValue(mockUserRole);

      await controller.findOne(pathId);

      expect(service.findOne).toHaveBeenCalledWith(pathId);
    });

    it('should handle @Body() decorator for request body parsing', async () => {
      const requestBody = {
        userId: 1,
        roleId: 1,
      };
      service.create.mockResolvedValue(mockUserRole);

      await controller.create(requestBody);

      expect(service.create).toHaveBeenCalledWith(requestBody);
    });
  });

  describe('Controller error Handling', () => {
    it('should not catch or transform service errors', async () => {
      const serviceError = new Error('Database connection failed');
      service.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll({})).rejects.toThrow(serviceError);
    });

    it('should maintain error context from service layer', async () => {
      const specificError = new Error('UserRole not found');
      specificError.name = 'NotFoundError';
      service.findOne.mockRejectedValue(specificError);

      try {
        await controller.findOne(999);
      } catch (error) {
        expect(error).toBe(specificError);
        expect(error.name).toBe('NotFoundError');
      }
    });
  });

  describe('Controller return type', () => {
    it('should have correct return type for findAll', async () => {
      service.findAll.mockResolvedValue(mockUserRoles);

      const result = await controller.findAll({});

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBe(mockUserRoles);
    });

    it('should have correct return type for findOne', async () => {
      service.findOne.mockResolvedValue(mockUserRole);

      const result = await controller.findOne(1);

      expect(result).toBe(mockUserRole);

      // null
      service.findOne.mockResolvedValue(null);
      const nullResult = await controller.findOne(999);
      expect(nullResult).toBeNull();
    });

    it('should have correct return type for create', async () => {
      service.create.mockResolvedValue(mockUserRole);

      const result = await controller.create(mockCreateUserDto);

      expect(result).toBe(mockUserRole);
      expect(result).toBeDefined();
    });
  });
});
