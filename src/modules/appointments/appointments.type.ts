export interface AppointmentFilter {
  id?: number;
  doctorId?: number;
  roomId?: number;
  memberId?: number;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  status?: number;
  statuses?: number[];
  serviceItemId?: number;
  serviceItemIds?: number[];
}
