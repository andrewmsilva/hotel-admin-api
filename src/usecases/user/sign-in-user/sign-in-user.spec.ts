import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { User, UserCredentials } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user/user.repository';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SignInUserUseCase } from './sign-in-user.usecase';
import { isJWT } from 'class-validator';
import { ConfigModule } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Seed } from 'src/seeds/seed';

describe('SignInUserUseCase', () => {
  let signInUserUseCase: SignInUserUseCase;
  const seed = new Seed();

  const userProps = seed.user.createProps();
  const credentials: UserCredentials = {
    email: userProps.email,
    password: seed.user.defaultPassword,
  };

  let repositoryResult: [User, string];

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        JwtModule.register({}),
      ],
      providers: [
        SignInUserUseCase,
        AuthorizationRepository,
        JwtService,
        {
          provide: UserRepository,
          useValue: {
            findOneByEmailWithPassword: () => {
              return repositoryResult;
            },
          },
        },
      ],
    }).compile();

    signInUserUseCase = testModule.get<SignInUserUseCase>(SignInUserUseCase);

    repositoryResult = [
      new User({ id: randomUUID(), ...userProps }),
      userProps.password,
    ];
  });

  it('should sign in a user', async () => {
    const result = await signInUserUseCase.execute(credentials);

    expect(isJWT(result.accessToken)).toBe(true);
  });

  it('should throw error if email is incorrect', async () => {
    repositoryResult = null;

    await expect(
      signInUserUseCase.execute({
        ...credentials,
        email: 'incorrect@gmail.com',
      }),
    ).rejects.toThrow(
      new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
    );
  });

  it('should throw error if password is incorrect', async () => {
    await expect(
      signInUserUseCase.execute({
        ...credentials,
        password: 'incorrectpassword',
      }),
    ).rejects.toThrow(
      new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
    );
  });
});
