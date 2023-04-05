import { Gender, GuestProps } from 'src/entities/guest.entity';

export class GuestSeed {
  createProps(guestProps?: Partial<GuestProps>): GuestProps {
    const defaultProps: GuestProps = {
      firstName: 'Firstname',
      lastName: 'Lastname',
      email: 'firstname@gmail.com',
      phone: '+5511922223333',
      gender: Gender.Other,
    };

    return Object.assign(defaultProps, guestProps);
  }
}
