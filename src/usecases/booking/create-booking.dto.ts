import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';
import { BookingProps } from 'src/entities/booking.entity';

export class CreateBookingDTO
  implements Omit<BookingProps, 'id' | 'room' | 'guest'>
{
  @IsUUID()
  @IsNotEmpty()
  guestId: string;

  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @IsDate()
  @IsNotEmpty()
  checkInAt: Date;

  @IsDate()
  @IsNotEmpty()
  checkOutAt: Date;
}
