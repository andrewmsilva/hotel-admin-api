import { BookingProps } from 'src/entities/booking.entity';
import { DateTime } from 'luxon';

export class BookingSeed {
  readonly bookingDays = 5;

  createProps(bookingProps?: Partial<BookingProps>): BookingProps {
    const today = new Date(new Date().toDateString());
    const defaultProps: BookingProps = {
      roomId: null,
      guestId: null,
      checkInAt: today,
      checkOutAt: DateTime.fromJSDate(today)
        .plus({ days: this.bookingDays })
        .toJSDate(),
      priceCents: 13000,
      totalCents: 13000 * this.bookingDays,
    };

    return Object.assign(defaultProps, bookingProps);
  }
}
