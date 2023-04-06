import { BookingSeed } from './booking.seed';
import { HotelSeed } from './hotel.seed';
import { RoomSeed } from './room.seed';
import { UserSeed } from './user.seed';

export class Seed {
  readonly user: UserSeed;
  readonly hotel: HotelSeed;
  readonly room: RoomSeed;
  readonly booking: BookingSeed;

  constructor() {
    this.user = new UserSeed();
    this.hotel = new HotelSeed();
    this.room = new RoomSeed();
    this.booking = new BookingSeed();
  }
}
