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

  /**
   * 獲取醫生工作日期
   * @param doctorId
   * @param startDate //'2025-08-25'
   * @param endDate //'2025-08-29'
   * @returns
   */
  @Get(':doctorId/workingDays')
  async getDoctorWorkingDays(
    @Param('doctorId') doctorId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const workingDays =
      await this.doctorScheduleService.getSchedulesByDateRange(
        doctorId,
        startDate,
        endDate,
      );
    return {
      success: true,
      data: workingDays,
    };
  }

  /**
   * 獲取醫生詳細可用時段
   * @param doctorId
   * @param doctorId
   * @param startDate //'2025-08-25'
   * @param endDate //'2025-08-25'
   * @returns
   */
  @Get(':doctorId/availableTimes')
  async getDoctorAvailableTimes(
    @Param('doctorId') doctorId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('intervalMinutes') intervalMinutes: number,
  ) {
    const availableTimes = await this.doctorScheduleService.generateTimeSlots(
      doctorId,
      startDate,
      endDate,
      intervalMinutes,
    );
    return {
      success: true,
      data: availableTimes,
    };
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
