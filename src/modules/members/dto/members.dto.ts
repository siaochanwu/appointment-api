export class CreateMemberDto {
  name: string;
  email: string;
  birthday: Date;
  mobile: string;
  address: string;
  createdUserId: number;
}

export class UpdateMemberDto extends CreateMemberDto {
  isActive: boolean;
}
