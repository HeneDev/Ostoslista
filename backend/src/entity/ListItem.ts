import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
import { ListItemState } from '../model';
import { DeletableEntity } from './DeletableEntity';
import { List } from './List';

@Entity()
export class ListItem extends DeletableEntity {
  @Column({ type: 'varchar', nullable: true, length: 254 })
  @IsOptional()
  @MaxLength(254)
  name: string | null;

  @Column({ type: 'real', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount: number | null;

  @Column({ type: 'varchar', nullable: true, length: 31 })
  @IsOptional()
  @MaxLength(31)
  unit: string | null;

  @Column({ type: 'int' })
  @IsDefined()
  listId: number;

  @ManyToOne(() => List, (list) => list.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listId', referencedColumnName: 'id' })
  @IsDefined()
  list: List;

  @Column({ type: 'enum', enum: ListItemState, default: ListItemState.NONE })
  @IsOptional()
  @IsEnum(ListItemState)
  state: ListItemState;

  @Column({ type: 'real', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price: number | null;
}
