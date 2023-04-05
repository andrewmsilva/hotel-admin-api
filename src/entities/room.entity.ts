import { Hotel } from './hotel.entity';

export class Room {
  readonly id: string;

  hotel: Hotel;

  name: string;
  identifier: string;
  maxGuests: number;

  basePriceCents?: number;
  priceCents: number;

  constructor(props: Room) {
    this.id = props.id;
    this.hotel = props.hotel;
    this.name = props.name;
    this.identifier = props.identifier;
    this.maxGuests = props.maxGuests;
    this.basePriceCents = props.basePriceCents;
    this.priceCents = props.priceCents;
  }
}

export interface RoomProps extends Omit<Room, 'id' | 'hotel'> {
  hotelId: string;
}
