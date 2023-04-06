import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  AccessToken,
  AccessTokenPayload,
} from 'src/entities/access-token.entity';
import { User } from 'src/entities/user.entity';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AddToBalanceDTO } from 'src/usecases/user/add-to-balance/add-to-balance.dto';
import { AddToBalanceUseCase } from 'src/usecases/user/add-to-balance/add-to-balance.usecase';
import { SignInUserDTO } from 'src/usecases/user/sign-in-user/sign-in-user.dto.user';
import { SignInUserUseCase } from 'src/usecases/user/sign-in-user/sign-in-user.usecase';
import { SignUpUserDTO } from 'src/usecases/user/sign-up-user/sign-up-user.dto';
import { SignUpUserUseCase } from 'src/usecases/user/sign-up-user/sign-up-user.usecase';

@Controller('user')
export class UserController {
  constructor(
    private readonly signUpUserUseCase: SignUpUserUseCase,
    private readonly signInUserUseCase: SignInUserUseCase,
    private readonly addToBalanceUseCase: AddToBalanceUseCase,
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

  @UseGuards(AuthorizationGuard)
  @Put('balance')
  @HttpCode(HttpStatus.OK)
  addToBalance(
    @Body() balanceProps: AddToBalanceDTO,
    @Req() { user }: { user: AccessTokenPayload },
  ): Promise<User> {
    return this.addToBalanceUseCase.execute(balanceProps, user.id);
  }
}
