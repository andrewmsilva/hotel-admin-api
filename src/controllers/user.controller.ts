import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AccessToken } from 'src/entities/access-token.entity';
import { SignInUserDTO } from 'src/usecases/user/sign-in-user/sign-in-user.dto.user';
import { SignInUserUseCase } from 'src/usecases/user/sign-in-user/sign-in-user.usecase';
import { SignUpUserDTO } from 'src/usecases/user/sign-up-user/sign-up-user.dto';
import { SignUpUserUseCase } from 'src/usecases/user/sign-up-user/sign-up-user.usecase';

@Controller('user')
export class UserController {
  constructor(
    private readonly signUpUserUseCase: SignUpUserUseCase,
    private readonly signInUserUseCase: SignInUserUseCase,
  ) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() userProps: SignUpUserDTO): Promise<AccessToken> {
    return this.signUpUserUseCase.execute(userProps);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() credentials: SignInUserDTO): Promise<AccessToken> {
    return this.signInUserUseCase.execute(credentials);
  }
}
