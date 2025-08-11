export class CreateItemDto {
  type: string;
  name: string;
  code: string;

  duration: number;
}

export class UpdateItemDto extends CreateItemDto {}
