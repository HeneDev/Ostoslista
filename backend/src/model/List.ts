import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { ListItemCreate } from './ListItem';

class ListBase {
  @IsOptional()
  @MaxLength(254)
  name?: string | null;

  @IsOptional()
  @MaxLength(1023)
  description?: string | null;

  @IsOptional()
  @MaxLength(254)
  category?: string | null;
}

export class ListUpdate extends ListBase {
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number | null;

  @IsBoolean()
  @IsOptional()
  finished?: boolean;
}

export class ListCreate extends ListBase {
  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean;

  @IsArray()
  @IsOptional()
  items?: ListItemCreate[];
}
