export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}

export class User {
  readonly id: string;

  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;

  balanceCents: number;

  constructor(props: User) {
    this.id = props.id;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.phone = props.phone;
    this.gender = props.gender;
    this.balanceCents = props.balanceCents;
  }
}

export interface UserProps extends Omit<User, 'id' | 'balanceCents'> {
  password: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}
