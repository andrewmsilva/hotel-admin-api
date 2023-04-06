import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { User } from 'src/entities/user.entity';
import { SignUpUserUseCase } from './sign-up-user.usecase';
import { UserRepository } from 'src/repositories/user/user.repository';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';
import { JwtModule } from '@nestjs/jwt';
import { Seed } from 'src/seeds/seed';
import { isJWT } from 'class-validator';
import { ConfigModule } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('SignUpUserUseCase', () => {
  let signUpUserUseCase: SignUpUserUseCase;
  const seed = new Seed();

  const uuid = randomUUID();
  let createdUser: User;
  const userProps = seed.user.createProps({ password: 'Strong123!' });

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        JwtModule.register({}),
      ],
      providers: [
        SignUpUserUseCase,
        AuthorizationRepository,
        {
          provide: UserRepository,
          useValue: { create: () => createdUser },
        },
      ],
    }).compile();

    createdUser = new User({ id: uuid, balanceCents: 0, ...userProps });

    signUpUserUseCase = testModule.get<SignUpUserUseCase>(SignUpUserUseCase);
  });

  it('should create a user', async () => {
    const { accessToken } = await signUpUserUseCase.execute(userProps);

    expect(isJWT(accessToken)).toBe(true);
  });

  it('should throw conflict error if user already exists', async () => {
    createdUser = null;

    await expect(signUpUserUseCase.execute(userProps)).rejects.toThrow(
      new HttpException('User already exists', HttpStatus.CONFLICT),
    );
  });
});
