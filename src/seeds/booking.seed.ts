import { BookingProps } from 'src/entities/booking.entity';
import { DateTime } from 'luxon';

export class BookingSeed {
  readonly bookingDays = 5;

  createProps(bookingProps?: Partial<BookingProps>): BookingProps {
    const defaultProps: BookingProps = {
      roomId: null,
      guestId: null,
      checkInAt: DateTime.now().toJSDate(),
      checkOutAt: DateTime.now().plus({ days: this.bookingDays }).toJSDate(),
      priceCents: 13000,
      totalCents: 13000 * this.bookingDays,
    };

    return Object.assign(defaultProps, bookingProps);
  }
}
