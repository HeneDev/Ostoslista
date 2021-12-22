import {
  IsDefined,
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';

export class UserLogin {
  @IsEmail()
  @IsDefined()
  email: string;

  @IsString()
  @MinLength(6)
  @IsDefined()
  password: string;
}

export class UserCreate extends UserLogin {
  @IsString()
  @IsDefined()
  username: string;
}

export enum UserRight {
  GUEST = 'guest',
  USER = 'user',
  OWNER = 'owner',
}
