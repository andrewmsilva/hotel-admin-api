import { HotelProps } from 'src/entities/hotel.entity';

export class HotelSeed {
  createProps(hotelProps?: Partial<HotelProps>): HotelProps {
    const defaultProps: HotelProps = {
      name: 'Hotel Name',
      stars: 4.5,
      email: 'hotel@gmail.com',
      phone: '+5511922223333',
      address: 'Rua Abobrinha, 123, Cidade',
    };

    return Object.assign(defaultProps, hotelProps);
  }
}
