import { HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user/user.repository';
import { SignInUserDTO } from './sign-in-user.dto.user';

export class SignInUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(credentials: SignInUserDTO): Promise<void> {
    const user = await this.userRepository.findOneByCredentials(credentials);

    if (!user) {
      throw new HttpException('Credentials invalid', HttpStatus.UNAUTHORIZED);
    }
  }
}
