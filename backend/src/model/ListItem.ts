import {
  IsEnum,
  IsNumber,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export enum ListItemState {
  NONE = 'none',
  SELECTED = 'selected',
  MISSING = 'missing',
}

export class ListItemCreate {
  @IsOptional()
  @MaxLength(254)
  name?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number | null;

  @IsOptional()
  @MaxLength(31)
  unit?: string | null;
}

export class ListItemUpdate extends ListItemCreate {
  @IsEnum(ListItemState)
  @IsOptional()
  state?: ListItemState;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number | null;
}
