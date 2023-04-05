import { Booking } from 'src/entities/booking.entity';
import { mapGuestModel } from '../guest/guest.mapper';
import { mapRoomModel } from '../room/room.mapper';
import { BookingModel } from './booking.schema';
import { RoomModel } from '../room/room.schema';

export function mapBookingModel(
  bookingModel: BookingModel,
  roomModel: RoomModel,
): Booking {
  return new Booking({
    id: bookingModel._id,
    guest: mapGuestModel(bookingModel.guest),
    room: mapRoomModel(roomModel),
    checkInAt: bookingModel.checkInAt,
    checkOutAt: bookingModel.checkOutAt,
    priceCents: bookingModel.priceCents,
    totalCents: bookingModel.totalCents,
  });
}
