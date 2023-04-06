import { IsNotEmpty, IsUUID } from 'class-validator';

export class CheckInDTO {
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;
}
