import { Room } from 'src/entities/room.entity';
import { mapHotelModel } from '../hotel/hotel.mapper';
import { RoomModel } from './room.schema';

export function mapRoomModel(roomModel: RoomModel): Room {
  return new Room({
    id: roomModel._id,
    hotel: mapHotelModel(roomModel.hotel),
    name: roomModel.name,
    identifier: roomModel.identifier,
    maxGuests: roomModel.maxGuests,
    oldPriceCents: roomModel.oldPriceCents,
    priceCents: roomModel.priceCents,
  });
}
