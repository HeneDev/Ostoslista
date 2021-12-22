import { IsDefined, IsEnum } from 'class-validator';
import {
  Column, Entity, JoinColumn, ManyToOne,
} from 'typeorm';
import { List } from './List';
import { UserRight } from '../model';
import { IdEntity } from './IdEntity';
import { User } from './User';

@Entity()
export class ListPermission extends IdEntity {
  @ManyToOne(() => List, (list) => list.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listId', referencedColumnName: 'id' })
  @IsDefined()
  list: List;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  @IsDefined()
  user: User;

  @Column({ type: 'enum', enum: UserRight })
  @IsDefined()
  @IsEnum(UserRight)
  userRight: UserRight;
}
