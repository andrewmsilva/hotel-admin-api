import { Controller, Get } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';

@Controller()
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get()
  getHello(): string {
    return this.userRepository.getHello();
  }
}
