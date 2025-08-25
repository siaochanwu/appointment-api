import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DoctorSchedule } from './entities/doctorSchedule.entity';
import {
  Repository,
  FindOptionsWhere,
  MoreThanOrEqual,
  LessThanOrEqual,
  Between,
} from 'typeorm';
import { DoctorScheduleFilter } from './doctorSchedules.type';
import { CreateDoctorScheduleDto } from './dto/doctorSchedules.dto';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class DoctorSchedulesService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private readonly doctorScheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
  ) {}

  async findAll(query: DoctorScheduleFilter): Promise<DoctorSchedule[]> {
    const where: FindOptionsWhere<DoctorSchedule> = {};
    if (query.id) {
      where.id = query.id;
    }
    if (query.doctorId) {
      where.doctorId = query.doctorId;
    }
    if (query.roomId) {
      where.roomId = query.roomId;
    }
    if (query.dayOfWeek) {
      where.dayOfWeek = query.dayOfWeek;
    }
    if (query.startTime && query.endTime) {
      where.startTime = Between(query.startTime, query.endTime);
    } else if (query.startTime) {
      where.startTime = MoreThanOrEqual(query.startTime);
    } else if (query.endTime) {
      where.startTime = LessThanOrEqual(query.endTime);
    }

    return this.doctorScheduleRepository.find({
      where,
      relations: ['doctor', 'room'],
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
        doctor: {
          id: true,
          name: true,
          code: true,
        },
        room: {
          id: true,
          number: true,
          type: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<DoctorSchedule | null> {
    return this.doctorScheduleRepository.findOne({
      where: { id },
      relations: ['doctor', 'room'],
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        isActive: true,
        doctor: {
          id: true,
          name: true,
          code: true,
        },
        room: {
          id: true,
          number: true,
          type: true,
        },
      },
    });
  }

  async create(createDoctorScheduleDto: CreateDoctorScheduleDto) {
    const doctorExist = await this.usersRepository.findOne({
      where: { id: createDoctorScheduleDto.doctorId },
    });
    if (!doctorExist) {
      throw new Error('Doctor not found');
    }

    const roomExist = await this.roomsRepository.findOne({
      where: { id: createDoctorScheduleDto.roomId },
    });
    if (!roomExist) {
      throw new Error('Room not found');
    }
    if (
      createDoctorScheduleDto.dayOfWeek < 0 ||
      createDoctorScheduleDto.dayOfWeek > 6
    ) {
      throw new Error('Invalid day of week');
    }

    return this.doctorScheduleRepository.save(createDoctorScheduleDto);
  }

  async update(id: number, updateDoctorScheduleDto: CreateDoctorScheduleDto) {
    await this.doctorScheduleRepository.update(id, updateDoctorScheduleDto);
    return this.findOne(id);
  }
}
