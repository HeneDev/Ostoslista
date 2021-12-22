import { IsDate } from 'class-validator';
import { DeleteDateColumn } from 'typeorm';
import { IdEntity } from './IdEntity';

/**
 * Base entity which can be marked as deleted.
 */
export abstract class DeletableEntity extends IdEntity {
  @DeleteDateColumn({ type: 'timestamptz' })
  @IsDate()
  deletedAt: Date | null;
}
