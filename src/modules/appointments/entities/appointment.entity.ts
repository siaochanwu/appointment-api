import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Room } from 'src/modules/rooms/entities/room.entity';
import { Member } from 'src/modules/members/entities/member.entity';
import { Item } from 'src/modules/items/entities/item.entity';

export enum AppointmentStatus {
  SCHEDULED = 1,
  CONFIRMED = 2,
  IN_PROGRESS = 3,
  COMPLETED = 4,
  NO_SHOW = 5,
  CANCELLED = 6,
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'appointment_date', type: 'date' })
  appointmentDate: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ type: 'int', default: AppointmentStatus.SCHEDULED })
  status: AppointmentStatus;

  @Column({ default: false })
  deleted: boolean;

  @Column({ name: 'service_item_id' })
  serviceItemId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'service_item_id' })
  serviceItem: Item;
}
