import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmBookingDTO {
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  fileName: string;
}
