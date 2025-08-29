import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
  In,
  FindOptionsWhere,
} from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';
import { Member } from '../members/entities/member.entity';
import { Item } from '../items/entities/item.entity';
import { AppointmentFilter } from './appointments.type';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointments.dto';
import { AppointmentStatus } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,

    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async findAll(query: AppointmentFilter): Promise<Appointment[]> {
    const where: FindOptionsWhere<Appointment> = {};
    if (query.id) {
      where.id = query.id;
    }
    if (query.doctorId) {
      where.doctorId = query.doctorId;
    }
    if (query.roomId) {
      where.roomId = query.roomId;
    }
    if (query.serviceItemId) {
      where.serviceItemId = query.serviceItemId;
    }
    if (query.serviceItemIds) {
      where.serviceItemId = In(query.serviceItemIds);
    }
    if (query.memberId) {
      where.memberId = query.memberId;
    }
    if (query.appointmentDate) {
      where.appointmentDate = query.appointmentDate;
    }
    if (query.startTime && query.endTime) {
      where.startTime = Between(query.startTime, query.endTime);
    } else if (query.startTime) {
      where.startTime = MoreThanOrEqual(query.startTime);
    } else if (query.endTime) {
      where.startTime = LessThanOrEqual(query.endTime);
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.statuses) {
      where.status = In(query.statuses);
    }

    return this.appointmentRepository.find({
      where,
      relations: ['doctor', 'room', 'member', 'serviceItem'],
    });
  }

  async findOne(id: number): Promise<Appointment | null> {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: ['doctor', 'room', 'member', 'serviceItem'],
    });
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    // 驗證醫生是否存在
    const doctor = await this.usersRepository.findOne({
      where: { id: createAppointmentDto.doctorId, isActive: true },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found or inactive');
    }
    // 驗證會員是否存在
    const member = await this.membersRepository.findOne({
      where: { id: createAppointmentDto.memberId, isActive: true },
    });
    if (!member) {
      throw new NotFoundException('Member not found or inactive');
    }
    // 驗證服務項目是否存在
    const item = await this.itemsRepository.findOne({
      where: { id: createAppointmentDto.serviceItemId, deleted: false },
    });
    if (!item) {
      throw new NotFoundException('Item not found or inactive');
    }
    // 預約時段檢查
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        doctor: { id: createAppointmentDto.doctorId },
        appointmentDate: createAppointmentDto.appointmentDate,
        startTime: createAppointmentDto.startTime,
        endTime: createAppointmentDto.endTime,
      },
    });
    if (existingAppointments.length > 0) {
      throw new NotFoundException('Appointment time already exists');
    }

    return this.appointmentRepository.save({
      ...createAppointmentDto,
      status: AppointmentStatus.SCHEDULED,
    });
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment | null> {
    console.log(updateAppointmentDto);
    await this.appointmentRepository.update(id, updateAppointmentDto);
    return this.findOne(id);
  }
}
