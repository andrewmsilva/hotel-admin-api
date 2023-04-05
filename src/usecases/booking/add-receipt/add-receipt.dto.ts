import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddReceiptDTO {
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  fileName: string;
}
