import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { UserFilter } from './users.type';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(query: UserFilter): Promise<User[]> {
    const where: FindOptionsWhere<User> = {};
    if (query.id) {
      where.id = query.id;
    }
    if (query.name) {
      where.name = query.name;
    }
    if (query.code) {
      where.code = query.code;
    }
    if (query.email) {
      where.email = query.email;
    }
    return this.usersRepository.find({ where });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findOneByName(name: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { name } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.password = hashedPassword;
    return this.usersRepository.save(createUserDto);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
      updateUserDto.password = hashedPassword;
    }
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }
}
