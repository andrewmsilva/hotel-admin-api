import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { User, UserCredentials, UserProps } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user/user.repository';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SignInUserUseCase } from './sign-in-user.usecase';
import * as bcrypt from 'bcrypt';
import { isJWT } from 'class-validator';
import { ConfigModule } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('SignInUserUseCase', () => {
  let signInUserUseCase: SignInUserUseCase;

  const credentials: UserCredentials = {
    email: 'firstname@gmail.com',
    password: 'Strong123!',
  };

  const uuid = randomUUID();
  const userProps: UserProps = {
    firstName: 'Firstname',
    lastName: 'Lastname',
    email: credentials.email,
    password: bcrypt.hashSync(credentials.password, 10),
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
      new User({ id: uuid, ...userProps }),
      userProps.password,
    ];
  });

  it('should sign in a user', async () => {
    const result = await signInUserUseCase.execute(credentials);

    expect(isJWT(result.accessToken)).toBeTruthy;
  });

  it('should throw error if email is wrong', async () => {
    repositoryResult = null;

    await expect(
      signInUserUseCase.execute({
        ...credentials,
        email: 'wrong@gmail.com',
      }),
    ).rejects.toThrow(
      new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
    );
  });

  it('should throw error if password is wrong', async () => {
    await expect(
      signInUserUseCase.execute({
        ...credentials,
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(
      new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED),
    );
  });
});
