import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  doctorId: number;
  roomId: number;
  memberId: number;
  appointmentDate: string; // 2025-08-25
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  serviceItemId: number;
}

export class UpdateAppointmentDto extends CreateAppointmentDto {
  status?: AppointmentStatus;
}
