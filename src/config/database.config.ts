import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { UserRole } from 'src/modules/userRoles/entities/userRole.entity';
import { Item } from 'src/modules/items/entities/item.entity';
import { Room } from 'src/modules/rooms/entities/room.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA,
  entities: [User, Role, UserRole, Item, Room],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};
