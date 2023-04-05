import { BookingProps } from 'src/entities/booking.entity';
import { DateTime } from 'luxon';

export class BookingSeed {
  createProps(bookingProps?: Partial<BookingProps>): BookingProps {
    const defaultProps: BookingProps = {
      room: null,
      guest: null,
      checkInAt: DateTime.now().toJSDate(),
      checkOutAt: DateTime.now().plus({ days: 5 }).toJSDate(),
    };

    return Object.assign(defaultProps, bookingProps);
  }
}
