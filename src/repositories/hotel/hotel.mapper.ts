import { Hotel } from 'src/entities/hotel.entity';
import { HotelModel } from './hotel.schema';

export function mapHotelModel(guestModel: HotelModel): Hotel {
  return new Hotel({
    id: guestModel._id,
    name: guestModel.name,
    stars: guestModel.stars,
    email: guestModel.email,
    phone: guestModel.phone,
    address: guestModel.address,
  });
}
