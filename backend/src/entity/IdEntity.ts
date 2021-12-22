import { IsDate, IsInt } from 'class-validator';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Base entity which has an `id` primary key, automatically set `createdAt` field
 * and an automatically updated `updatedAt` field.
 */
export abstract class IdEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  @IsInt()
  id: number;

  @CreateDateColumn({ type: 'timestamptz' })
  @IsDate()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @IsDate()
  updatedAt: Date;
}
