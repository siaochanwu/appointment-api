import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Member } from './entities/member.entity';
import { MemberFilter } from './members.type';
import { CreateMemberDto, UpdateMemberDto } from './dto/members.dto';

interface CodeQueryResult {
  code: string;
}

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: MemberFilter): Promise<Member[]> {
    const where: any = {};
    if (query.id) {
      where.id = query.id;
    }
    if (query.name) {
      where.name = query.name;
    }
    if (query.code) {
      where.code = query.code;
    }
    if (query.mobile) {
      where.mobile = query.mobile;
    }
    return this.memberRepository.find({
      where,
      relations: ['createdUser'],
      select: {
        createdUser: {
          id: true,
          name: true,
          code: true,
        },
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { id },
      relations: ['createdUser'],
      select: {
        createdUser: {
          id: true,
          name: true,
          code: true,
        },
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    // 檢查手機是否已註冊
    const exist = await this.memberRepository.findOne({
      where: { mobile: createMemberDto.mobile },
    });
    if (exist) {
      throw new Error('會員手機已註冊');
    }

    return this.dataSource.transaction(async (manager) => {
      const result: CodeQueryResult[] = await manager.query(`
        SELECT code 
        FROM appointment.members
        WHERE code like 'E%'
        ORDER BY code DESC
        LIMIT 1
        FOR UPDATE`);
      let nextNumber: number = 1;
      if (result.length > 0) {
        const currentCode: string = result[0].code;
        const currentNumber: number = parseInt(currentCode.substring(1), 10);
        nextNumber = currentNumber + 1;
      }
      const newCode: string = 'E' + nextNumber.toString().padStart(8, '0');
      // 創建會員
      const member = manager.create(Member, {
        ...createMemberDto,
        code: newCode,
      });

      return manager.save(member);
    });
  }

  async update(
    id: number,
    updateMemberDto: UpdateMemberDto,
  ): Promise<Member | null> {
    await this.memberRepository.update(id, updateMemberDto);
    return this.findOne(id);
  }
}
