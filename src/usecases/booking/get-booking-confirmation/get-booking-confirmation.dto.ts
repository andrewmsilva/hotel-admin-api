import { IsUUID, IsNotEmpty } from 'class-validator';

export class GetBookingConfirmationDTO {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
