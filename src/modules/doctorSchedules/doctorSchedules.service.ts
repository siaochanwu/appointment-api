import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class DoctorSchedulesService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private readonly doctorScheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
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
    where.isActive = true;

    return this.doctorScheduleRepository.find({
      where,
      relations: ['doctor', 'room'],
      select: {
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
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<DoctorSchedule | null> {
    return this.doctorScheduleRepository.findOne({
      where: { id, isActive: true },
      relations: ['doctor', 'room'],
      select: {
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
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async create(createDoctorScheduleDto: CreateDoctorScheduleDto) {
    // 驗證醫生和診間是否存在
    await this.validateDoctorAndRoom(createDoctorScheduleDto);

    // 驗證星期
    if (
      createDoctorScheduleDto.dayOfWeek < 0 ||
      createDoctorScheduleDto.dayOfWeek > 6
    ) {
      throw new Error('Invalid day of week');
    }
    // 檢查時間衝突
    const conflictingSchedules = await this.doctorScheduleRepository.find({
      where: {
        doctorId: createDoctorScheduleDto.doctorId,
        roomId: createDoctorScheduleDto.roomId,
        dayOfWeek: createDoctorScheduleDto.dayOfWeek,
        isActive: true,
      },
    });

    const hasConflict = conflictingSchedules.some((schedule) =>
      this.timeOverlaps(
        createDoctorScheduleDto.startTime,
        createDoctorScheduleDto.endTime,
        schedule.startTime,
        schedule.endTime,
      ),
    );

    if (hasConflict) {
      throw new ConflictException(
        'Schedule time conflicts with existing schedule',
      );
    }

    return this.doctorScheduleRepository.save(createDoctorScheduleDto);
  }

  async update(id: number, updateDoctorScheduleDto: CreateDoctorScheduleDto) {
    await this.doctorScheduleRepository.update(id, updateDoctorScheduleDto);
    return this.findOne(id);
  }

  // 將週期性班表轉換為具體日期的班表
  async getSchedulesByDateRange(
    doctorId: number,
    startDate: string,
    endDate: string,
  ): Promise<Array<DoctorSchedule & { date: Date }>> {
    // 1. 獲取醫生的所有週期性班表
    const weeklySchedules = await this.doctorScheduleRepository.find({
      where: {
        doctorId,
        isActive: true,
      },
      relations: ['doctor', 'room'],
      select: {
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
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });

    if (weeklySchedules.length === 0) {
      return [];
    }

    // 2. 生成日期範圍內的所有日期
    const dates = this.getDateRange(startDate, endDate);
    const schedulesWithDates: Array<DoctorSchedule & { date: Date }> = [];

    for (const dateStr of dates) {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

      // 3. 找到該日期對應的班表
      const matchingSchedules = weeklySchedules.filter((schedule) => {
        // 檢查 day_of_week 是否匹配
        if (schedule.dayOfWeek !== dayOfWeek) {
          return false;
        }

        return true;
      });

      // 4. 將匹配的班表加上具體日期
      for (const schedule of matchingSchedules) {
        schedulesWithDates.push({
          ...schedule,
          date,
        });
      }
    }

    return schedulesWithDates;
  }

  async generateTimeSlots(
    doctorId: number,
    startDate: string,
    endDate: string,
    intervalMinutes: number,
  ) {
    const schedule = await this.getSchedulesByDateRange(
      doctorId,
      startDate,
      endDate,
    );
    const slots: { startTime: string; endTime: string; date: string }[] = [];

    for (const s of schedule) {
      const start = new Date(`${startDate}T${s.startTime}`);
      const end = new Date(`${endDate}T${s.endTime}`);

      let current = new Date(start);

      const formatTime = (d: Date) => d.toTimeString().slice(0, 5); // 轉成 "HH:MM"

      while (current < end) {
        const next = new Date(current.getTime() + intervalMinutes * 60000);
        if (next > end) break;

        slots.push({
          startTime: formatTime(current),
          endTime: formatTime(next),
          date: startDate,
        });

        current = next;
      }
    }
    console.log(slots);

    return slots;
  }

  private getDateRange(start_date: string, end_date: string): string[] {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const dates: string[] = [];

    for (
      let date = startDate;
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  private async validateDoctorAndRoom(
    createDoctorScheduleDto: CreateDoctorScheduleDto,
  ): Promise<void> {
    const doctor = await this.usersRepository.findOne({
      where: { id: createDoctorScheduleDto.doctorId, isActive: true },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found or inactive');
    }

    const room = await this.roomsRepository.findOne({
      where: { id: createDoctorScheduleDto.roomId, deleted: false },
    });
    if (!room) {
      throw new NotFoundException('Room not found or inactive');
    }
  }

  private timeOverlaps(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    return start1 < end2 && end1 > start2;
  }
}
