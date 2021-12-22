import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { DeletableEntity } from './DeletableEntity';
import { ListItem } from './ListItem';
import { ListPermission } from './ListPermission';

@Entity()
export class List extends DeletableEntity {
  @Column({ type: 'varchar', nullable: true, length: 254 })
  @IsOptional()
  @MaxLength(254)
  name: string | null;

  @Column({ type: 'varchar', nullable: true, length: 1023 })
  @MaxLength(1203)
  @IsOptional()
  description: string | null;

  @Column({ type: 'varchar', nullable: true, length: 254 })
  @MaxLength(254)
  @IsOptional()
  category: string | null;

  @Column({ type: 'bool' })
  @IsBoolean()
  isTemplate: boolean;

  @Column({ type: 'real', nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  @IsDate()
  finishedAt: Date | null;

  @OneToMany(() => ListItem, (item) => item.list, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @IsArray()
  items: ListItem[];

  @OneToMany(() => ListPermission, (item) => item.list, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @IsArray()
  permissions: ListPermission[];
}
