import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  address: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_user_id' })
  createdUser: User;

  @Column({ name: 'created_user_id' })
  createdUserId: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
