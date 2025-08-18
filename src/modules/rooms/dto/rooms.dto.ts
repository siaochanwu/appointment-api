export class CreateRoomDto {
  number: number;
  type: string;
}

export class UpdateRoomDto extends CreateRoomDto {}