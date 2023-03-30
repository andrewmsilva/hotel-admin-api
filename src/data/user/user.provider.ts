import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserProps } from 'src/entities/user.entity';
import { mapUserModel } from './user.mapper';
import { UserModel } from './user.schema';

@Injectable()
export class UserProvider {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
  ) {}

  async create(userProps: UserProps): Promise<User> {
    const user = new this.userModel(userProps);
    await user.save();
    return mapUserModel(user);
  }

  async findOne(): Promise<User> {
    const user = await this.userModel.findOne().exec();
    return mapUserModel(user);
  }
}
