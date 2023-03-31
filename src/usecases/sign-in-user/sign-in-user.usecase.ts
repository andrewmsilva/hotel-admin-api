import { HttpException, HttpStatus } from '@nestjs/common';
import { AccessToken } from 'src/entities/access-token.entity';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';
import { UserRepository } from 'src/repositories/user/user.repository';
import { SignInUserDTO } from './sign-in-user.dto.user';

export class SignInUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private authorizationRepository: AuthorizationRepository,
  ) {}

  async execute(credentials: SignInUserDTO): Promise<AccessToken> {
    const user = await this.userRepository.findOneByCredentials(credentials);

    if (!user) {
      throw new HttpException('Credentials invalid', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this.authorizationRepository.createJWT(user);

    return { accessToken };
  }
}
