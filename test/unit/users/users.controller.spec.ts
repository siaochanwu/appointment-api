import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.service';
import { CreateUserDto, UpdateUserDto } from 'src/modules/users/dto/users.dto';
import { UserFilter } from 'src/modules/users/users.type';
import { User } from 'src/modules/users/entities/user.entity';
import { ServerOpeningEvent } from 'typeorm';
import { spec } from 'node:test/reporters';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  // mock data
  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    code: 'USER001',
    email: 'john@example.com',
    password: 'hashedPassword',
    isActive: true,
    userRoles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers: User[] = [mockUser];

  const mockCreateUserDto: CreateUserDto = {
    name: 'New User',
    code: 'USER002',
    email: 'newuser@example.com',
    password: 'password123',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    name: 'Updated User',
    email: 'updated@example.com',
  };

  beforeEach(async () => {
    const mockUsersService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(
      UsersService,
    ) as jest.Mocked<UsersService>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users findAll', () => {
    it('should call service.findAll with query params', async () => {
      const query: UserFilter = { id: 1, name: 'John' };
      service.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
    });

    it('should call service.findAll with empty query', async () => {
      const query: UserFilter = {};
      service.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should propagate service error', async () => {
      const query: UserFilter = {};
      const error = new Error('Service error');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll(query)).rejects.toThrow(error);
    });
  });

  describe('GET /users/:id findOne', () => {
    it('should call service.findOne with correct id param', async () => {
      const id = 1;
      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockUser);
    });

    it('should handle id not found', async () => {
      const id = 999;
      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it('should propagate service error', async () => {
      const id = 1;
      const error = new Error('Service error');
      service.findOne.mockRejectedValue(error);

      await expect(controller.findOne(id)).rejects.toThrow(error);
    });
  });

  describe('POST /users create', () => {
    it('should call service.create with request body', async () => {
      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(mockCreateUserDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockUser);
    });

    it('should handle empty request body', async () => {
      const emptyDto = {} as CreateUserDto;
      service.create.mockResolvedValue(mockUser);

      await controller.create(emptyDto);

      expect(service.create).toHaveBeenCalledWith(emptyDto);
    });

    it('should propagate service error', async () => {
      const error = new Error('Service error');
      service.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(error);
    });
  });

  describe('PUT /users/:id update', () => {
    it('should call service.update with correct id and DTO', async () => {
      const id = 1;
      service.update.mockResolvedValue(mockUser);

      const result = await controller.update(id, mockUpdateUserDto);

      expect(service.update).toHaveBeenCalledWith(id, mockUpdateUserDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockUser);
    });

    it('should handle empty request body', async () => {
      const id = 1;
      const emptyDto = {} as UpdateUserDto;
      service.update.mockResolvedValue(mockUser);

      await controller.update(id, emptyDto);

      expect(service.update).toHaveBeenCalledWith(id, emptyDto);
    });

    it('should handle id not found', async () => {
      const id = 999;
      service.update.mockResolvedValue(null);

      const result = await controller.update(id, mockUpdateUserDto);

      expect(service.update).toHaveBeenCalledWith(id, mockUpdateUserDto);
    });

    it('should propagate service error', async () => {
      const id = 1;
      const error = new Error('Service error');
      service.update.mockRejectedValue(error);

      await expect(controller.update(id, mockUpdateUserDto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('HTTP decorator behavior', () => {
    it('should handle @Query() decorator with multiple params', async () => {
      const complexQuery: UserFilter = {
        id: 1,
        name: 'John',
        code: 'USER001',
        email: 'john@example.com',
      };
      service.findAll.mockResolvedValue(mockUsers);

      await controller.findAll(complexQuery);

      expect(service.findAll).toHaveBeenCalledWith(complexQuery);
    });

    it('should handle @Param() decorator for id extraction', async () => {
      const pathId = 42;
      service.findOne.mockResolvedValue(mockUser);

      await controller.findOne(pathId);

      expect(service.findOne).toHaveBeenCalledWith(pathId);
    });

    it('should handle @Body() decorator for request body parsing', async () => {
      const requestBody = {
        name: 'API User',
        code: 'API001',
        email: 'api@test.com',
        password: 'apipassword',
      };
      service.create.mockResolvedValue(mockUser);

      await controller.create(requestBody);

      expect(service.create).toHaveBeenCalledWith(requestBody);
    });
  });

  describe('Controller error handling', () => {
    it('should not catch or transform service errors', async () => {
      const serviceError = new Error('Database connection failed');
      service.findAll.mockRejectedValue(serviceError);

      await expect(controller.findAll({})).rejects.toThrow(serviceError);
    });

    it('should maintain error context from service layer', async () => {
      const specificError = new Error('User not found');
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
      service.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll({});

      expect(Array.isArray(result)).toBe(true);
      expect(result).toBe(mockUsers);
    });

    it('should have correct return type for findOne', async () => {
      service.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(1);

      expect(result).toBe(mockUser);

      // null
      service.findOne.mockResolvedValue(null);
      const nullResult = await controller.findOne(999);
      expect(nullResult).toBeNull();
    });

    it('should have correct return type for create', async () => {
      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(mockCreateUserDto);

      expect(result).toBe(mockUser);
      expect(result).toBeDefined();
    });

    it('should have correct return type for update', async () => {
      service.update.mockResolvedValue(mockUser);

      const result = await controller.update(1, mockUpdateUserDto);

      expect(result).toBe(mockUser);

      //null
      service.update.mockResolvedValue(null);
      const nullResult = await controller.update(999, mockUpdateUserDto);
      expect(nullResult).toBeNull();
    });
  });
});
