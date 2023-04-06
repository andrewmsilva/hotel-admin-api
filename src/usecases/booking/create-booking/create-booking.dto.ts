import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';
import { BookingProps } from 'src/entities/booking.entity';

export class CreateBookingDTO
  implements
    Omit<
      BookingProps,
      'id' | 'priceCents' | 'totalCents' | 'status' | 'receipt' | 'userId'
    >
{
  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  checkInAt: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  checkOutAt: Date;
}
