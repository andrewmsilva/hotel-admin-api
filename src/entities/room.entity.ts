import { Hotel } from './hotel.entity';

export enum RoomStatus {
  Available = 'Available',
  Booked = 'Booked',
  Inactive = 'Inactive',
}

export class Room {
  readonly id: string;

  hotel: Hotel;

  name: string;
  identifier: string;
  status: RoomStatus;
  maxGuests: number;

  oldPriceCents?: number;
  priceCents: number;

  constructor(props: Room) {
    this.id = props.id;
    this.hotel = props.hotel;
    this.name = props.name;
    this.identifier = props.identifier;
    this.status = props.status;
    this.maxGuests = props.maxGuests;
    this.oldPriceCents = props.oldPriceCents;
    this.priceCents = props.priceCents;
  }
}

export type RoomProps = Omit<Room, 'id'>;
