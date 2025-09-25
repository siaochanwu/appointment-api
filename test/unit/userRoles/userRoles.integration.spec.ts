import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as request from 'supertest';
import { UserRolesController } from 'src/modules/userRoles/userRoles.controller';
import { UserRolesModule } from 'src/modules/userRoles/userRoles.module';
import { UserRolesService } from 'src/modules/userRoles/userRoles.service';
import { UserRole } from 'src/modules/userRoles/entities/userRole.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Role, RoleCode } from 'src/modules/roles/entities/role.entity';
import { CreateUserRolesDto } from 'src/modules/userRoles/dto/userRoles.dto';
import { UserRolesFilter } from 'src/modules/userRoles/userRoles.type';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config();

describe('UserRoles Integration Tests', () => {
  let app: INestApplication;
  let userRolesService: UserRolesService;
  let userRolesController: UserRolesController;
  let usersRepository: Repository<User>;
  let rolesRepository: Repository<Role>;
  let userRolesRepository: Repository<UserRole>;
  let dataSource: DataSource;

  // 測試數據
  const testUser1Data = {
    name: 'Integration User 1',
    code: 'INT001',
    email: 'integration1@test.com',
    password: 'password123',
  };

  const testUser2Data = {
    name: 'Integration User 2',
    code: 'INT002',
    email: 'integration2@test.com',
    password: 'password456',
  };

  const testRole1Data = {
    name: 'Administrator',
    code: RoleCode.ADMIN,
  };

  const testRole2Data = {
    name: 'Doctor',
    code: RoleCode.DOCTOR,
  };

  let createdUser1: User;
  let createdUser2: User;
  let createdRole1: Role;
  let createdRole2: Role;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT ?? '5432') || 5432,
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_NAME,
          schema: process.env.DB_SCHEMA,
          entities: [User, UserRole, Role],
          synchronize: true,
          logging: false,
          dropSchema: false,
        }),
        UserRolesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 獲取服務和控制器實例
    userRolesService = moduleFixture.get<UserRolesService>(UserRolesService);
    userRolesController =
      moduleFixture.get<UserRolesController>(UserRolesController);
    userRolesRepository = moduleFixture.get<Repository<UserRole>>(
      getRepositoryToken(UserRole),
    );
    usersRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    rolesRepository = moduleFixture.get<Repository<Role>>(
      getRepositoryToken(Role),
    );
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
    await app.close();
  });

  beforeEach(async () => {
    // 關閉現有連線
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    // 重新初始化資料源
    await dataSource.initialize();
    await dataSource.synchronize(true); // true = 清空並重建

    // debug
    // const existingUserRoles = await userRolesRepository.count();
    // const existingUsers = await usersRepository.count();
    // const existingRoles = await rolesRepository.count();

    // console.log(
    //   `Before cleanup - UserRoles: ${existingUserRoles}, Users: ${existingUsers}, Roles: ${existingRoles}`,
    // );

    createdUser1 = await usersRepository.save({
      ...testUser1Data,
      isActive: true,
    });
    createdUser2 = await usersRepository.save({
      ...testUser2Data,
      isActive: true,
    });
    createdRole1 = await rolesRepository.save({
      ...testRole1Data,
      deleted: false,
    });
    createdRole2 = await rolesRepository.save({
      ...testRole2Data,
      deleted: false,
    });
  });

  describe('Module Dependencies', () => {
    it('should have all dependencies inject correctly', () => {
      expect(userRolesService).toBeDefined();
      expect(userRolesController).toBeDefined();
      expect(userRolesRepository).toBeDefined();
      expect(usersRepository).toBeDefined();
      expect(rolesRepository).toBeDefined();
    });

    it('should have database connection established', () => {
      expect(dataSource.isInitialized).toBe(true);
    });
  });

  describe('Service-repository Integration', () => {
    it('should create a user role through service and persist to database', async () => {
      const createUserDto = {
        userId: createdUser1.id,
        roleId: createdRole1.id,
      };

      const createdUserRole = await userRolesService.create(createUserDto);

      expect(createdUserRole).toBeDefined();
      expect(createdUserRole.id).toBeDefined();
      expect(createdUserRole.userId).toBe(createdUser1.id);
      expect(createdUserRole.roleId).toBe(createdRole1.id);
      expect(createdUserRole.user).toBeDefined();
      expect(createdUserRole.role).toBeDefined();
      expect(createdUserRole.user.id).toBe(createdUser1.id);
      expect(createdUserRole.role.id).toBe(createdRole1.id);

      // 驗證數據確實存在於數據庫中
      const savedUserRole = await userRolesRepository.findOne({
        where: {
          id: createdUserRole.id,
        },
        relations: ['user', 'role'],
      });
      expect(savedUserRole).toBeDefined();
      expect(savedUserRole?.userId).toBe(createdUser1.id);
      expect(savedUserRole?.roleId).toBe(createdRole1.id);
    });

    it('should find user roles through service from database', async () => {
      const userRole1 = await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });
      const userRole2 = await userRolesService.create({
        userId: createdUser2.id,
        roleId: createdRole2.id,
      });

      const allUserRoles = await userRolesService.findAll({});

      expect(allUserRoles).toHaveLength(2);
      expect(allUserRoles.map((userRole) => userRole.roleId)).toContain(
        userRole1.id,
      );
      expect(allUserRoles.map((userRole) => userRole.roleId)).toContain(
        userRole2.id,
      );

      allUserRoles.forEach((userRole) => {
        expect(userRole.user).toBeDefined();
        expect(userRole.role).toBeDefined();
      });
    });

    it('should filter user roles correctly through service', async () => {
      const userRole1 = await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });
      const userRole2 = await userRolesService.create({
        userId: createdUser2.id,
        roleId: createdRole2.id,
      });

      const filteredByUser = await userRolesService.findAll({
        userId: userRole1.id,
      });

      expect(filteredByUser).toHaveLength(1);
      expect(filteredByUser[0].userId).toBe(userRole1.userId);

      const filteredByRole = await userRolesService.findAll({
        roleId: userRole2.roleId,
      });

      expect(filteredByRole).toHaveLength(1);
      expect(filteredByRole[0].roleId).toBe(userRole2.roleId);
    });

    it('should prevent duplicate user role assignment', async () => {
      const createDto = {
        userId: createdUser1.id,
        roleId: createdRole1.id,
      };

      // 首次創建應該成功
      await userRolesService.create(createDto);

      await expect(userRolesService.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(userRolesService.create(createDto)).rejects.toThrow(
        `User ${createDto.userId} already has role ${createDto.roleId}`,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 999;
      const createDto: CreateUserRolesDto = { userId, roleId: createdRole1.id };

      await expect(userRolesService.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(userRolesService.create(createDto)).rejects.toThrow(
        `User with ID ${userId} not found`,
      );
    });

    it('should throw NotFoundException when role not found', async () => {
      const roleId = 999;
      const createDto: CreateUserRolesDto = { userId: createdUser1.id, roleId };

      await expect(userRolesService.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(userRolesService.create(createDto)).rejects.toThrow(
        `Role with ID ${roleId} not found`,
      );
    });
  });

  describe('Controller-Service Integration', () => {
    it('should create a user role through controller', async () => {
      const createUserDto = {
        userId: createdUser1.id,
        roleId: createdRole1.id,
      };

      const result = await userRolesController.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.userId).toBe(createdUser1.id);
      expect(result.roleId).toBe(createdRole1.id);

      // 驗證通過 service 能找到創建的用戶角色
      const savedUserRole = await userRolesService.findOne(result.id);
      expect(savedUserRole).toBeDefined();
      expect(savedUserRole?.userId).toBe(createdUser1.id);
    });

    it('should findAll user roles through controller', async () => {
      await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });
      await userRolesService.create({
        userId: createdUser2.id,
        roleId: createdRole2.id,
      });

      const query: UserRolesFilter = {};
      const userRoles = await userRolesController.findAll(query);

      expect(userRoles).toHaveLength(2);
      expect(userRoles.map((userRole) => userRole.userId)).toContain(
        createdUser1.id,
      );
      expect(userRoles.map((userRole) => userRole.userId)).toContain(
        createdUser2.id,
      );
    });

    it('should find user role through controller', async () => {
      const createdUserRole = await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });

      const userRole = await userRolesController.findOne(createdUserRole.id);

      expect(userRole).toBeDefined();
      expect(userRole?.userId).toBe(createdUser1.id);
      expect(userRole?.roleId).toBe(createdRole1.id);
    });

    it('should handle query parameters through controller', async () => {
      await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });
      await userRolesService.create({
        userId: createdUser2.id,
        roleId: createdRole2.id,
      });

      const query: UserRolesFilter = {
        userId: createdUser1.id,
      };
      const filterUserRoles = await userRolesController.findAll(query);

      expect(filterUserRoles).toHaveLength(1);
      expect(filterUserRoles[0].userId).toBe(createdUser1.id);
    });
  });

  describe('HTTP Integration', () => {
    it('should create a user role via POST /user-roles', async () => {
      const createUserDto: CreateUserRolesDto = {
        userId: createdUser1.id,
        roleId: createdRole1.id,
      };

      return request(app.getHttpServer())
        .post('/user-roles')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.userId).toBe(createdUser1.id);
          expect(res.body.roleId).toBe(createdRole1.id);
          expect(res.body.user).toBeDefined();
          expect(res.body.role).toBeDefined();
        });
    });

    it('should get all user roles via GET /user-roles', async () => {
      await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });
      await userRolesService.create({
        userId: createdUser2.id,
        roleId: createdRole2.id,
      });

      return request(app.getHttpServer())
        .get('/user-roles')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(2);
          expect(
            res.body.map((userRole: UserRole) => userRole.userId),
          ).toContain(createdUser1.id);
          expect(
            res.body.map((userRole: UserRole) => userRole.userId),
          ).toContain(createdUser2.id);
        });
    });

    it('should get user role by id via GET /user-roles/:id', async () => {
      const createdUserRole = await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });
      console.log('www', createdUserRole.id);

      return request(app.getHttpServer())
        .get(`/user-roles/${createdUserRole.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUserRole.id);
          expect(res.body.userId).toBe(createdUser1.id);
        });
    });

    it('should filter user roles via GET /user-roles with query params', async () => {
      await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });
      await userRolesService.create({
        userId: createdUser2.id,
        roleId: createdRole2.id,
      });

      return request(app.getHttpServer())
        .get('/user-roles')
        .query({ userId: createdUser2.id })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].userId).toBe(createdUser2.id);
        });
    });

    it('should return 409 for duplicate create', async () => {
      const createUserDto: CreateUserRolesDto = {
        userId: createdUser1.id,
        roleId: createdRole1.id,
      };

      await userRolesService.create(createUserDto);

      return request(app.getHttpServer())
        .post('/user-roles')
        .send(createUserDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe(
            `User ${createdUser1.id} already has role ${createdRole1.id}`,
          );
        });
    });

    it('should return 404 for non-existent user', async () => {
      const createDto: CreateUserRolesDto = {
        userId: 999,
        roleId: createdRole1.id,
      };

      return request(app.getHttpServer())
        .post('/user-roles')
        .send(createDto)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('User with ID 999 not found');
        });
    });

    it('should return 404 for non-existent role', async () => {
      const createDto: CreateUserRolesDto = {
        userId: createdUser1.id,
        roleId: 999,
      };

      return request(app.getHttpServer())
        .post('/user-roles')
        .send(createDto)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('Role with ID 999 not found');
        });
    });
  });

  describe('Business Logic Integration', () => {
    it('should handle user with multiple roles', async () => {
      await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });
      await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole2.id,
      });

      const userRoles = await userRolesController.findAll({
        userId: createdUser1.id,
      });

      expect(userRoles).toHaveLength(2);
      expect(userRoles.map((userRole) => userRole.roleId)).toContain(
        createdRole1.id,
      );
      expect(userRoles.map((userRole) => userRole.roleId)).toContain(
        createdRole2.id,
      );
    });

    it('should handle role with multiple users', async () => {
      await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });
      await userRolesService.create({
        userId: createdUser2.id,
        roleId: createdRole1.id,
      });

      const userRoles = await userRolesController.findAll({
        roleId: createdRole1.id,
      });

      expect(userRoles).toHaveLength(2);
      expect(userRoles.map((userRole) => userRole.userId)).toContain(
        createdUser1.id,
      );
      expect(userRoles.map((userRole) => userRole.userId)).toContain(
        createdUser2.id,
      );
    });
  });

  describe('Data Consistency Tests', () => {
    it('should maintain data consistency across operations', async () => {
      const createdUserRole = await userRolesService.create({
        userId: createdUser1.id,
        roleId: createdRole1.id,
      });

      const serviceResult = await userRolesService.findOne(createdUserRole.id);
      const controllerResult = await userRolesController.findOne(
        createdUserRole.id,
      );
      const dbResult = await userRolesRepository.findOne({
        where: {
          id: createdUserRole.id,
        },
      });

      expect(serviceResult?.id).toBe(createdUserRole.id);
      expect(controllerResult?.id).toBe(createdUserRole.id);
      expect(dbResult?.id).toBe(createdUserRole.id);

      expect(serviceResult?.userId).toBe(createdUser1.id);
      expect(controllerResult?.userId).toBe(createdUser1.id);
      expect(dbResult?.userId).toBe(createdUser1.id);
    });

    it('should handle concurrent operations', async () => {
      const createPromises = [
        userRolesService.create({
          userId: createdUser1.id,
          roleId: createdRole1.id,
        }),
        userRolesService.create({
          userId: createdUser1.id,
          roleId: createdRole2.id,
        }),
        userRolesService.create({
          userId: createdUser2.id,
          roleId: createdRole1.id,
        }),
      ];

      const results = await Promise.all(createPromises);

      expect(results).toHaveLength(3);

      const allUserRoles = await userRolesController.findAll({});

      expect(allUserRoles).toHaveLength(3);
    });
  });
});
