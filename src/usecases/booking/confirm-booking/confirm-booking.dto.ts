import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmBookingDTO {
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  fileName: string;
}
