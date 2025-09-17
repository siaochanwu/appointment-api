export class CreateUserDto {
  name: string;
  code: string;
  password: string;
  email: string;
}

export class UpdateUserDto {
  name?: string;
  code?: string;
  password?: string;
  email?: string;
}
