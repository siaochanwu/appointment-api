import { Module } from '@nestjs/common';
import { DoctorSchedulesService } from './doctorSchedules.service';
import { DoctorSchedulesController } from './doctorSchedules.controller';
import { DoctorSchedule } from './entities/doctorSchedule.entity';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorSchedule, User, Room, Appointment]),
  ],
  controllers: [DoctorSchedulesController],
  providers: [DoctorSchedulesService],
})
export class DoctorSchedulesModule {}
