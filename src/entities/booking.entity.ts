import { Guest } from './guest.entity';
import { Room } from './room.entity';

export class Booking {
  readonly id: string;

  guest: Guest;
  room: Room;
  checkInAt: Date;
  checkOutAt: Date;

  constructor(props: Booking) {
    this.id = props.id;
    this.guest = props.guest;
    this.room = props.room;
    this.checkInAt = props.checkInAt;
    this.checkOutAt = props.checkOutAt;
  }
}

export interface BookingProps extends Omit<Booking, 'id' | 'guest' | 'room'> {
  guestId: string;
  roomId: string;
}
