import { Room } from './room.entity';
import { User } from './user.entity';

export enum BookingStatus {
  Created = 'Created',
  Confirmed = 'Confirmed',
  Concluded = 'Concluded',
}

export class Booking {
  readonly id: string;

  user: User;
  room: Room;

  status: BookingStatus;

  checkInAt: Date;
  checkOutAt: Date;
  priceCents: number;
  totalCents: number;

  constructor(props: Booking) {
    this.id = props.id;
    this.user = props.user;
    this.room = props.room;
    this.status = props.status;
    this.checkInAt = props.checkInAt;
    this.checkOutAt = props.checkOutAt;
    this.priceCents = props.priceCents;
    this.totalCents = props.totalCents;
  }
}

export interface BookingProps
  extends Omit<Booking, 'id' | 'user' | 'room' | 'status'> {
  userId: string;
  roomId: string;
}
