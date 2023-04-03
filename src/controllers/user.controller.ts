import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AccessToken } from 'src/entities/access-token.entity';
import { User } from 'src/entities/user.entity';
import { CreateUserDTO } from 'src/usecases/create-user/create-user.dto';
import { CreateUserUseCase } from 'src/usecases/create-user/create-user.usecase';
import { SignInUserDTO } from 'src/usecases/sign-in-user/sign-in-user.dto.user';
import { SignInUserUseCase } from 'src/usecases/sign-in-user/sign-in-user.usecase';

@Controller('user')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly signInUserUseCase: SignInUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() userProps: CreateUserDTO): Promise<User> {
    return this.createUserUseCase.execute(userProps);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() credentials: SignInUserDTO): Promise<AccessToken> {
    return this.signInUserUseCase.execute(credentials);
  }
}
