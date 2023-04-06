import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignUpUserDTO } from './sign-up-user.dto';
import { UserRepository } from 'src/repositories/user/user.repository';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';
import { AccessToken } from 'src/entities/access-token.entity';

@Injectable()
export class SignUpUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private authorizationRepository: AuthorizationRepository,
  ) {}

  async execute(props: SignUpUserDTO): Promise<AccessToken> {
    const encryptedPassword = this.authorizationRepository.encrypt(
      props.password,
    );

    const user = await this.userRepository.create({
      ...props,
      password: encryptedPassword,
    });

    if (!user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const accessToken = this.authorizationRepository.createJWT({
      id: user.id,
      firstName: user.firstName,
      email: user.email,
    });

    return { accessToken };
  }
}
