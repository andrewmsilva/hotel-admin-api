import { RoomProps } from 'src/entities/room.entity';

export class RoomSeed {
  createProps(roomProps?: Partial<RoomProps>): RoomProps {
    const defaultProps: RoomProps = {
      hotelId: null,
      name: 'Room Name',
      identifier: '1203',
      maxGuests: 2,
      oldPriceCents: 18000,
      priceCents: 13000,
    };

    return Object.assign(defaultProps, roomProps);
  }
}
