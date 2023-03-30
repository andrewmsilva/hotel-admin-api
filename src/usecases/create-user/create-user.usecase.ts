import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user.repository';
import { CreateUserDTO } from './create-user.dto';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(props: CreateUserDTO): Promise<User> {
    const encryptedPassword = bcrypt.hashSync(props.password, SALT_ROUNDS);

    return this.userRepository.create({
      ...props,
      password: encryptedPassword,
    });
  }
}
