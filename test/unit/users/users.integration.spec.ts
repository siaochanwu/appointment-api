import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { UsersService } from 'src/modules/users/users.service';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersController } from 'src/modules/users/users.controller';
import { User } from 'src/modules/users/entities/user.entity';
import { UserRole } from 'src/modules/userRoles/entities/userRole.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { CreateUserDto, UpdateUserDto } from 'src/modules/users/dto/users.dto';
import { UserFilter } from 'src/modules/users/users.type';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config();

describe('Users Integration Tests', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let usersController: UsersController;
  let usersRepository: Repository<User>;
  let dataSource: DataSource;

  // 測試數據
  const testUser1Data: CreateUserDto = {
    name: 'Integration User 1',
    code: 'INT001',
    email: 'integration1@test.com',
    password: 'password123',
  };

  const testUser2Data: CreateUserDto = {
    name: 'Integration User 2',
    code: 'INT002',
    email: 'integration2@test.com',
    password: 'password456',
  };

  const updateUserData: UpdateUserDto = {
    name: 'Updated Integration User',
    email: 'updated@test.com',
  };

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
          dropSchema: true, // 每次測試前清空資料庫
        }),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 獲取服務和控制器實例
    usersService = moduleFixture.get<UsersService>(UsersService);
    usersController = moduleFixture.get<UsersController>(UsersController);
    usersRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
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
    await dataSource.query('SET session_replication_role = replica;');
    await dataSource.query(
      'TRUNCATE TABLE user_roles, users, roles RESTART IDENTITY;',
    );
    await dataSource.query('SET session_replication_role = DEFAULT;');
  });

  describe('Module Dependencies', () => {
    it('should have all dependencies inject correctly', () => {
      expect(usersService).toBeDefined();
      expect(usersController).toBeDefined();
      expect(usersRepository).toBeDefined();
    });

    it('should have database connection established', () => {
      expect(dataSource.isInitialized).toBe(true);
    });
  });

  describe('Service-repository Integration', () => {
    it('should create a user through service and persist to database', async () => {
      const createdUser = await usersService.create(testUser1Data);

      expect(createdUser).toBeDefined();
      expect(createdUser.id).toBeDefined();
      expect(createdUser.name).toBe(testUser1Data.name);
      expect(createdUser.code).toBe(testUser1Data.code);
      expect(createdUser.email).toBe(testUser1Data.email);
      expect(createdUser.password).not.toBe('password123'); // Password should be hashed(cannot use testUser1Data.password directly)

      // check if the user is saved in the database
      const savedUser = await usersRepository.findOne({
        where: {
          id: createdUser.id,
        },
      });
      expect(savedUser).toBeDefined();
      expect(savedUser?.name).toBe(testUser1Data.name);
    });

    it('should find users through service from database', async () => {
      await usersService.create(testUser1Data);
      await usersService.create(testUser2Data);

      const users = await usersService.findAll({});

      expect(users).toHaveLength(2);
      expect(users.map((user) => user.name)).toContain(testUser1Data.name);
      expect(users.map((user) => user.name)).toContain(testUser2Data.name);
    });

    it('should update a user through service and reflect in database', async () => {
      // Arrange
      const createdUser = await usersService.create(testUser1Data);

      //Act
      const updatedUser = await usersService.update(
        createdUser.id,
        updateUserData,
      );

      //Assert
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe(updateUserData.name);
      expect(updatedUser?.email).toBe(updateUserData.email);

      // check if the user is saved in the database
      const dbUser = await usersRepository.findOne({
        where: {
          id: createdUser.id,
        },
      });
      expect(dbUser).toBeDefined();
      expect(dbUser?.name).toBe(updateUserData.name);
      expect(dbUser?.email).toBe(updateUserData.email);
    });

    it('should filter users through service from database', async () => {
      const createdUser1 = await usersService.create(testUser1Data);
      const createdUser2 = await usersService.create(testUser2Data);

      //test filter by name
      const filterByName = await usersService.findAll({
        name: testUser2Data.name,
      });

      expect(filterByName).toHaveLength(1);
      expect(filterByName[0].name).toBe(testUser2Data.name);

      //test filter by code
      const filterByCode = await usersService.findAll({
        code: testUser2Data.code,
      });

      expect(filterByCode).toHaveLength(1);
      expect(filterByCode[0].code).toBe(testUser2Data.code);
    });
  });

  describe('Controller Integration', () => {
    it('should create a user through controller using service', async () => {
      const result = await usersController.create(testUser1Data);

      expect(result).toBeDefined();
      expect(result.name).toBe(testUser1Data.name);
      expect(result.password).not.toBe('password123');

      const foundUser = await usersService.findOne(result.id);
      expect(foundUser).toBeDefined();
      expect(foundUser?.name).toBe(testUser1Data.name);
    });

    it('should find all users through controller using service', async () => {
      await usersService.create(testUser1Data);
      await usersService.create(testUser2Data);

      const query: UserFilter = {};
      const result = await usersController.findAll(query);

      expect(result).toHaveLength(2);
      expect(result.map((user) => user.email)).toContain(testUser1Data.email);
      expect(result.map((user) => user.email)).toContain(testUser2Data.email);
    });

    it('should find user by id through controller using service', async () => {
      const createdUser = await usersService.create(testUser1Data);

      const foundUser = await usersController.findOne(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(testUser1Data.email);
    });

    it('should update user through controller using service', async () => {
      const createdUser = await usersService.create(testUser1Data);

      const updatedUser = await usersController.update(
        createdUser.id,
        updateUserData,
      );

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe(updateUserData.name);

      const verifyUser = await usersService.findOne(createdUser.id);
      expect(verifyUser?.name).toBe(updateUserData.name);
    });
  });

  describe('HTTP API Integration', () => {
    it('should create user via POST /users', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send(testUser1Data)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe(testUser1Data.name);
          expect(res.body.email).toBe(testUser1Data.email);
          expect(res.body.password).not.toBe('password123');
        });
    });

    it('should get users via GET /users', async () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(2);
          expect(res.body.map((user: User) => user.name)).toContain(
            testUser1Data.name,
          );
        });
    });

    it('should get user by id via GET /users/:id', async () => {
      const createdUser = await usersService.create(testUser1Data);
      return request(app.getHttpServer())
        .get(`/users/${createdUser.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdUser.id);
          expect(res.body.name).toBe(testUser1Data.name);
        });
    });

    it('should update user via PUT /users/:id', async () => {
      const createdUser = await usersService.create(testUser1Data);

      return request(app.getHttpServer())
        .put(`/users/${createdUser.id}`)
        .send(updateUserData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateUserData.name);
          expect(res.body.name).toBe(updateUserData.name);
          expect(res.body.email).toBe(updateUserData.email);
        });
    });

    it('should filter user via GET /users with query params', async () => {
      await usersService.create(testUser1Data);
      await usersService.create(testUser2Data);

      return request(app.getHttpServer())
        .get('/users')
        .query({ name: testUser2Data.name })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].name).toBe(testUser2Data.name);
        });
    });
  });

  describe('Data Consistency Tests', () => {
    it('should maintain data consistency across operations', async () => {
      const createdUser = await usersService.create(testUser1Data);

      const serviceResult = await usersService.findOne(createdUser.id);
      const controllerResult = await usersController.findOne(createdUser.id);
      const dbResult = await usersRepository.findOne({
        where: { id: createdUser.id },
      });

      expect(serviceResult?.id).toBe(createdUser.id);
      expect(controllerResult?.id).toBe(createdUser.id);
      expect(dbResult?.id).toBe(createdUser.id);

      expect(serviceResult?.name).toBe(testUser1Data.name);
      expect(controllerResult?.name).toBe(testUser1Data.name);
      expect(dbResult?.name).toBe(testUser1Data.name);
    });

    it('should handle concurrent operations correctly', async () => {
      const createPromises = [
        usersService.create({ ...testUser1Data }),
        usersService.create({ ...testUser2Data }),
        usersService.create({
          name: 'User 3',
          email: 'user3@ex.com',
          code: 'CODE3',
          password: 'password123',
        }),
      ];

      const createdUsers = await Promise.all(createPromises);

      expect(createdUsers).toHaveLength(3);
      expect(new Set(createdUsers.map((user) => user.id)).size).toBe(3);

      //check if users save in the database
      const allUsers = await usersService.findAll({});
      expect(allUsers).toHaveLength(3);
    });
  });
});
