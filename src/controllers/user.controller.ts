import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { CreateUserDTO } from 'src/usecases/create-user/create-user.dto';
import { CreateUserUseCase } from 'src/usecases/create-user/create-user.usecase';

@Controller('user')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() userProps: CreateUserDTO): Promise<User> {
    return this.createUserUseCase.execute(userProps);
  }
}
