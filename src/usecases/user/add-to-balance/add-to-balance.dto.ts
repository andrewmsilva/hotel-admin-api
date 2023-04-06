import { IsInt } from 'class-validator';

export class AddToBalanceDTO {
  @IsInt()
  valueCents: number;
}
