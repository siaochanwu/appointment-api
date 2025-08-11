import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { ItemFilter } from './items.type';
import { CreateItemDto, UpdateItemDto } from './dto/items.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async findAll(@Query() query: ItemFilter): Promise<Item[]> {
    return this.itemsService.findAll(query);
  }

  @Get('id')
  async findOne(@Param('id') id: number): Promise<Item | null> {
    return this.itemsService.findOne(id);
  }

  @Post()
  async create(@Body() createItemDto: CreateItemDto): Promise<Item> {
    return this.itemsService.create(createItemDto);
  }

  @Put('id')
  async update(@Param('id') id: number, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.update(id, updateItemDto);
  }
}
