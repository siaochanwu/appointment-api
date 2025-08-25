import { DoctorSchedulesService } from './doctorSchedules.service';
import { CreateDoctorScheduleDto } from './dto/doctorSchedules.dto';
import { Controller, Post, Body, Query, Get, Param, Put } from '@nestjs/common';
import { DoctorSchedule } from './entities/doctorSchedule.entity';
import { DoctorScheduleFilter } from './doctorSchedules.type';

@Controller('doctorSchedules')
export class DoctorSchedulesController {
  constructor(private readonly doctorScheduleService: DoctorSchedulesService) {}

  @Get()
  async findAll(
    @Query() query: DoctorScheduleFilter,
  ): Promise<DoctorSchedule[]> {
    return this.doctorScheduleService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<DoctorSchedule | null> {
    return this.doctorScheduleService.findOne(id);
  }

  @Post()
  async create(
    @Body() createDoctorScheduleDto: CreateDoctorScheduleDto,
  ): Promise<DoctorSchedule> {
    return this.doctorScheduleService.create(createDoctorScheduleDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDoctorScheduleDto: CreateDoctorScheduleDto,
  ): Promise<DoctorSchedule | null> {
    return this.doctorScheduleService.update(id, updateDoctorScheduleDto);
  }
}
