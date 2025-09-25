import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/userRole.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRolesService } from './userRoles.service';
import { UserRolesController } from './userRoles.controller';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRole, User, Role]),
    UsersModule,
    RolesModule,
  ],
  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}
