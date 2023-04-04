import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AccessToken } from 'src/entities/access-token.entity';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';
import { UserRepository } from 'src/repositories/user/user.repository';
import { SignInUserDTO } from './sign-in-user.dto.user';

@Injectable()
export class SignInUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private authorizationRepository: AuthorizationRepository,
  ) {}

  async execute(credentials: SignInUserDTO): Promise<AccessToken> {
    const userWithPassword =
      await this.userRepository.findOneByEmailWithPassword(credentials.email);

    if (userWithPassword) {
      const [user, encryptedPassword] = userWithPassword;
      const isPasswordMatching = this.authorizationRepository.compareEncryption(
        credentials.password,
        encryptedPassword,
      );

      if (isPasswordMatching) {
        const accessToken = this.authorizationRepository.createJWT({
          id: user.id,
          firstName: user.firstName,
          email: user.email,
        });
        return { accessToken };
      }
    }

    throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }
}
