export class Hotel {
  readonly id: string;

  name: string;
  stars: number;
  address: string;

  constructor(props: Hotel) {
    this.id = props.id;
    this.name = props.name;
    this.stars = props.stars;
    this.address = props.address;
  }
}

export type HotelProps = Omit<Hotel, 'id'>;
