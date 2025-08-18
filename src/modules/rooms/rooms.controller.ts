import { Controller, Get, Query, Post, Put, Param, Body } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room } from './entities/room.entity';
import { RoomFilter } from './rooms.type';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async findAll(@Query() query: RoomFilter): Promise<Room[]> {
    return this.roomsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Room | null> {
    return this.roomsService.findOne(id);
  }

  @Post()
  async create(@Body() createRoomDto: Room): Promise<Room> {
    return this.roomsService.create(createRoomDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateRoomDto: Room,
  ): Promise<Room | null> {
    return this.roomsService.update(id, updateRoomDto);
  }
}
