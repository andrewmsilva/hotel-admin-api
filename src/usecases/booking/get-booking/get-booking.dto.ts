import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetBookingDTO {
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;
}
