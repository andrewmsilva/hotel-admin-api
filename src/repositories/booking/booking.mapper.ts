import { Booking } from 'src/entities/booking.entity';
import { mapRoomModel } from '../room/room.mapper';
import { BookingModel } from './booking.schema';
import { RoomModel } from '../room/room.schema';
import { mapUserModel } from '../user/user.mapper';

export function mapBookingModel(
  bookingModel: BookingModel,
  roomModel: RoomModel,
): Booking {
  return new Booking({
    id: bookingModel._id,
    user: mapUserModel(bookingModel.user),
    room: mapRoomModel(roomModel),
    status: bookingModel.status,
    checkInAt: bookingModel.checkInAt,
    checkOutAt: bookingModel.checkOutAt,
    priceCents: bookingModel.priceCents,
    totalCents: bookingModel.totalCents,
  });
}
