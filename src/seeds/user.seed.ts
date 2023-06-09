import { Gender, UserProps } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';

export class UserSeed {
  readonly defaultPassword = 'Strong123!';

  createProps(userProps?: Partial<UserProps>): UserProps {
    const defaultProps: UserProps = {
      firstName: 'Firstname',
      lastName: 'Lastname',
      email: 'firstname@gmail.com',
      password: bcrypt.hashSync(this.defaultPassword, 10),
      phone: '+5511922223333',
      gender: Gender.Other,
    };

    return Object.assign(defaultProps, userProps);
  }
}
