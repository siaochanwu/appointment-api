export interface DoctorScheduleFilter {
  id?: number;
  doctorId?: number;
  roomId?: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
}
