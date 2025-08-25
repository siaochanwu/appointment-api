export class CreateDoctorScheduleDto {
  doctorId: number;
  roomId: number;
  dayOfWeek: number;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
}
