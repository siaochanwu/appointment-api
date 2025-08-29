import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { AppointmentFilter } from './appointments.type';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from './dto/appointments.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async findAll(@Query() query: AppointmentFilter): Promise<Appointment[]> {
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Query('id') id: number): Promise<Appointment | null> {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }
}
