import { Hotel } from './hotel.entity';

export class Room {
  readonly id: string;

  hotel: Hotel;

  name: string;
  identifier: string;
  maxGuests: number;

  oldPriceCents?: number;
  priceCents: number;

  constructor(props: Room) {
    this.id = props.id;
    this.hotel = props.hotel;
    this.name = props.name;
    this.identifier = props.identifier;
    this.maxGuests = props.maxGuests;
    this.oldPriceCents = props.oldPriceCents;
    this.priceCents = props.priceCents;
  }
}

export interface RoomProps extends Omit<Room, 'id' | 'hotel'> {
  hotelId: string;
}
