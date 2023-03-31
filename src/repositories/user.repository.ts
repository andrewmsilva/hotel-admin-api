import { Injectable } from '@nestjs/common';
import { UserDataSource } from 'src/data/user/user.datasource';
import { User, UserCredentials, UserProps } from 'src/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(private userDataSource: UserDataSource) {}

  async create(props: UserProps): Promise<User> {
    return this.userDataSource.create(props);
  }

  async findOneByCredentials(credentials: UserCredentials): Promise<User> {
    return this.userDataSource.findOneByCredentials(credentials);
  }
}
