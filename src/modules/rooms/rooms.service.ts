import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomFilter } from './rooms.type';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room) private readonly roomsRepository: Repository<Room>,
  ) {}

  async findAll(query: RoomFilter): Promise<Room[]> {
    const where: any = {};
    if (query.id) {
      where.id = query.id;
    }
    if (query.number) {
      where.number = query.number;
    }
    if (query.type) {
      where.type = query.type;
    }
    return this.roomsRepository.find({ where });
  }

  async findOne(id: number): Promise<Room | null> {
    return this.roomsRepository.findOne({ where: { id } });
  }

  async create(createRoomDto: Room): Promise<Room> {
    return this.roomsRepository.save(createRoomDto);
  }

  async update(id: number, updateRoomDto: Room): Promise<Room | null> {
    await this.roomsRepository.update(id, updateRoomDto);
    return this.findOne(id);
  }
}
