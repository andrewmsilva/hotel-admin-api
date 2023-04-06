import { Injectable } from '@nestjs/common';
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
        return null;
      }
      throw error;
    }
    return mapUserModel(user);
  }

  async findOneByEmailWithPassword(email: string): Promise<[User, string]> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return null;
    }
    return [mapUserModel(user), user.password];
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      return null;
    }
    return mapUserModel(user);
  }

  async findOneAndAddToBalance(id: string, valueCents: number): Promise<User> {
    let user = await this.userModel.findById(id);
    if (!user) {
      return null;
    }

    user = await this.userModel.findOneAndUpdate(
      { _id: id, __v: user.__v },
      { $inc: { __v: 1, balanceCents: valueCents } },
      { new: true },
    );
    if (!user) {
      return null;
    }

    return mapUserModel(user);
  }
}
