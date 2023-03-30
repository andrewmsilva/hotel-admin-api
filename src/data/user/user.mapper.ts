import { User } from 'src/entities/user.entity';
import { UserModel } from './user.schema';

export function mapUserModel(userModel: UserModel): User {
  return new User({
    id: userModel._id,
    firstName: userModel.firstName,
    lastName: userModel.lastName,
    email: userModel.email,
    password: userModel.password,
  });
}