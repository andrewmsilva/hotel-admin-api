import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user/user.repository';
import { AddToBalanceDTO } from './add-to-balance.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AddToBalanceUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(props: AddToBalanceDTO, userId: string): Promise<User> {
    let user = await this.userRepository.findOneById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user = await this.userRepository.findOneAndAddToBalance(
      userId,
      props.valueCents,
    );

    if (!user) {
      throw new HttpException(
        'User balance state was not updated, try again',
        HttpStatus.CONFLICT,
      );
    }

    return user;
  }
}
