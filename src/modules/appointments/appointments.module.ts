import { Module } from '@nestjs/common';
import { Appointment } from './entities/appointment.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Member } from '../members/entities/member.entity';
import { Item } from '../items/entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, User, Member, Item])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
