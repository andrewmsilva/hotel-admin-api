export class Hotel {
  readonly id: string;

  name: string;
  stars: number;
  email: string;
  phone: string;
  address: string;

  constructor(props: Hotel) {
    this.id = props.id;
    this.name = props.name;
    this.stars = props.stars;
    this.email = props.email;
    this.phone = props.phone;
    this.address = props.address;
  }
}

export type HotelProps = Omit<Hotel, 'id'>;
