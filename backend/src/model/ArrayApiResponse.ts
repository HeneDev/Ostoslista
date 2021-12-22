import { IsArray, IsInt } from 'class-validator';

export class ArrayApiResponse<T> {
  @IsArray()
  objects: T[];

  @IsInt()
  totalCount: number;

  constructor(response?: [T[], number]) {
    this.objects = response ? response[0] : [];
    this.totalCount = response ? response[1] : 0;
  }
}
