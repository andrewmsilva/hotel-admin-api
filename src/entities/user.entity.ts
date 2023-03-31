export class User {
  readonly id: string;

  firstName: string;
  lastName: string;
  email: string;

  constructor(props: User) {
    this.id = props.id;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
  }
}

export interface UserProps extends Omit<User, 'id'> {
  password: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}
