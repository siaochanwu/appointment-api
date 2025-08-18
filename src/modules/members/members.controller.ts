import { Controller, Get, Query, Post, Put, Param, Body } from '@nestjs/common';
import { MembersService } from './members.service';
import { Member } from './entities/member.entity';
import { MemberFilter } from './members.type';
import { CreateMemberDto, UpdateMemberDto } from './dto/members.dto';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async findAll(@Query() query: MemberFilter): Promise<Member[]> {
    return this.membersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Member | null> {
    return this.membersService.findOne(id);
  }

  @Post()
  async create(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
    return this.membersService.create(createMemberDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<Member | null> {
    return this.membersService.update(id, updateMemberDto);
  }
}
