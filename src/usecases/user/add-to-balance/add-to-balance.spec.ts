import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user/user.repository';
import { Seed } from 'src/seeds/seed';
import { AddToBalanceUseCase } from './add-to-balance.usecase';
import { AddToBalanceDTO } from './add-to-balance.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AddToBalanceUseCase', () => {
  let addToBalanceUseCase: AddToBalanceUseCase;
  const seed = new Seed();

  const balanceDto: AddToBalanceDTO = {
    valueCents: 10000,
  };

  let existentUser: User;
  let updatedUser: User;

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        AddToBalanceUseCase,
        {
          provide: UserRepository,
          useValue: {
            findOneById: () => {
              return existentUser;
            },
            findOneAndAddToBalance: () => {
              return updatedUser;
            },
          },
        },
      ],
    }).compile();

    addToBalanceUseCase =
      testModule.get<AddToBalanceUseCase>(AddToBalanceUseCase);

    const userProps = {
      id: randomUUID(),
      balanceCents: 0,
      ...seed.user.createProps(),
    };

    existentUser = new User(userProps);
    updatedUser = new User({
      ...userProps,
      balanceCents: balanceDto.valueCents,
    });
  });

  it("should add value to user's balance", async () => {
    const user = await addToBalanceUseCase.execute(balanceDto, existentUser.id);

    expect(user).toEqual(updatedUser);
  });

  it('should throw not found error if user does not exist', async () => {
    existentUser = null;

    await expect(
      addToBalanceUseCase.execute(balanceDto, updatedUser.id),
    ).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should throw conflict error if user state was invalid', async () => {
    updatedUser = null;

    await expect(
      addToBalanceUseCase.execute(balanceDto, existentUser.id),
    ).rejects.toThrow(
      new HttpException(
        'User balance state was not updated, try again',
        HttpStatus.CONFLICT,
      ),
    );
  });
});
