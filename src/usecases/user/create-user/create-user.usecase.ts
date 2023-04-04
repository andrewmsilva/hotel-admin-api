import { Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { CreateUserDTO } from './create-user.dto';
import { UserRepository } from 'src/repositories/user/user.repository';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private authorizationRepository: AuthorizationRepository,
  ) {}

  async execute(props: CreateUserDTO): Promise<User> {
    const encryptedPassword = this.authorizationRepository.encrypt(
      props.password,
    );

    return this.userRepository.create({
      ...props,
      password: encryptedPassword,
    });
  }
}
