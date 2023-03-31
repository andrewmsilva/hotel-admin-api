import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserCredentials, UserProps } from 'src/entities/user.entity';
import { AuthorizationRepository } from '../authorization/authorization.repository';
import { mapUserModel } from './user.mapper';
import { UserModel } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
    private authorizationRepository: AuthorizationRepository,
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

  async findOneByCredentials(credentials: UserCredentials): Promise<User> {
    const user = await this.userModel.findOne({ email: credentials.email });

    const areCredentialsValid =
      !!user &&
      this.authorizationRepository.compareEncryption(
        credentials.password,
        user.password,
      );

    if (areCredentialsValid) {
      return mapUserModel(user);
    }
  }
}
