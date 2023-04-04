import { Booking } from 'src/entities/booking.entity';
import { mapGuestModel } from '../guest/guest.mapper';
import { mapRoomModel } from '../room/room.mapper';
import { BookingModel } from './booking.schema';

export function mapBookingModel(bookingModel: BookingModel): Booking {
  return new Booking({
    id: bookingModel._id,
    guest: mapGuestModel(bookingModel.guest),
    room: mapRoomModel(bookingModel.room),
    startAt: bookingModel.startAt,
    endAt: bookingModel.endAt,
  });
}
