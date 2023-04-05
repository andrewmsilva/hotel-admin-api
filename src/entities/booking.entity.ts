import { Guest } from './guest.entity';
import { Room } from './room.entity';

export enum BookingStatus {
  Created = 'Created',
  Confirmed = 'Confirmed',
}

export class Booking {
  readonly id: string;

  guest: Guest;
  room: Room;

  status: BookingStatus;

  checkInAt: Date;
  checkOutAt: Date;
  priceCents: number;
  totalCents: number;

  constructor(props: Booking) {
    this.id = props.id;
    this.guest = props.guest;
    this.room = props.room;
    this.status = props.status;
    this.checkInAt = props.checkInAt;
    this.checkOutAt = props.checkOutAt;
    this.priceCents = props.priceCents;
    this.totalCents = props.totalCents;
  }
}

export interface BookingProps
  extends Omit<Booking, 'id' | 'guest' | 'room' | 'status'> {
  guestId: string;
  roomId: string;
}
