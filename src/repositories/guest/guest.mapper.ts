import { Guest } from 'src/entities/guest.entity';
import { GuestModel } from './guest.schema';

export function mapGuestModel(guestModel: GuestModel): Guest {
  return new Guest({
    id: guestModel._id,
    firstName: guestModel.firstName,
    lastName: guestModel.lastName,
    email: guestModel.email,
    phone: guestModel.phone,
    gender: guestModel.gender,
  });
}
