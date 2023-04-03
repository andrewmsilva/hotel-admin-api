import { Hotel } from 'src/entities/hotel.entity';
import { HotelModel } from './hotel.schema';

export function mapHotelModel(roomModel: HotelModel): Hotel {
  return new Hotel({
    id: roomModel._id,
    name: roomModel.name,
    stars: roomModel.stars,
    email: roomModel.email,
    phone: roomModel.phone,
    address: roomModel.address,
  });
}
