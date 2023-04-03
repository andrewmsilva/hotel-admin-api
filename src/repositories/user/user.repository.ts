import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserProps } from 'src/entities/user.entity';
import { mapUserModel } from './user.mapper';
import { UserModel } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
  ) {}

  async create(userProps: UserProps): Promise<User> {
    const user = new this.userModel(userProps);
    try {
      await user.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }
      throw error;
    }
    return mapUserModel(user);
  }

  async findOneByEmailWithPassword(email: string): Promise<[User, string]> {
    const user = await this.userModel.findOne({ email });

    if (user) {
      return [mapUserModel(user), user.password];
    }
  }
}
