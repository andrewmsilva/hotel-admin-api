export type UserProps = Omit<User, 'id'>;

export class User {
  readonly id: string;

  firstName: string;
  lastName: string;

  email: string;
  password: string;

  constructor(props: User) {
    Object.assign(this, props);
  }
}
