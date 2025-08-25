import { Injectable } from '@nestjs/common';
import { Item } from './entities/item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ItemFilter } from './items.type';
import { CreateItemDto, UpdateItemDto } from './dto/items.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private readonly itemsRepository: Repository<Item>,
  ) {}

  async findAll(query: ItemFilter): Promise<Item[]> {
    const where: FindOptionsWhere<Item> = {};
    if (query.id) {
      where.id = query.id;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.name) {
      where.name = query.name;
    }
    if (query.code) {
      where.code = query.code;
    }
    return this.itemsRepository.find({ where });
  }

  async findOne(id: number): Promise<Item | null> {
    return this.itemsRepository.findOne({ where: { id } });
  }

  async create(createItemDto: CreateItemDto): Promise<Item> {
    return this.itemsRepository.save(createItemDto);
  }

  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item | null> {
    await this.itemsRepository.update(id, updateItemDto);
    return this.findOne(id);
  }
}
