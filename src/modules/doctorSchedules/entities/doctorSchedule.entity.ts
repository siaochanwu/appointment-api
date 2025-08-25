import { Room } from 'src/modules/rooms/entities/room.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('doctor_schedules')
export class DoctorSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @Column({ name: 'day_of_week' })
  dayOfWeek: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string; // "HH:mm" format

  @Column({ name: 'end_time', type: 'time' })
  endTime: string; // "HH:mm" format

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ default: false })
  deleted: boolean;

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
}
