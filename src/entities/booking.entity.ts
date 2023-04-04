import { Guest } from './guest.entity';
import { Room } from './room.entity';

export class Booking {
  readonly id: string;

  guest: Guest;
  room: Room;
  startAt: Date;
  endAt: Date;

  constructor(props: Booking) {
    this.id = props.id;
    this.guest = props.guest;
    this.room = props.room;
    this.startAt = props.startAt;
    this.endAt = props.endAt;
  }
}

export interface BookingProps extends Omit<Booking, 'id' | 'guest' | 'room'> {
  guestId: string;
  roomId: string;
}
