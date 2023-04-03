export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export class Guest {
  readonly id: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;

  constructor(props: Guest) {
    this.id = props.id;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.phone = props.phone;
    this.gender = props.gender;
  }
}

export type GuestProps = Omit<Guest, 'id'>;
