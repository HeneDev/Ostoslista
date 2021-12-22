import { Column, Entity } from 'typeorm';
import {
  IsEmail, IsString, MinLength, IsDefined,
} from 'class-validator';
import { IdEntity } from './IdEntity';

@Entity()
export class User extends IdEntity {
  @Column()
  @IsDefined()
  username: string;

  @Column()
  @MinLength(6)
  @IsString()
  @IsDefined()
  password: string;

  @Column({ unique: true })
  @IsEmail()
  @IsDefined()
  email: string;
}
