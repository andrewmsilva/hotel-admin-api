import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { User, UserProps } from 'src/entities/user.entity';
import { CreateUserUseCase } from './create-user.usecase';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/repositories/user/user.repository';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';
import { JwtModule } from '@nestjs/jwt';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;

  const uuid = randomUUID();
  const userProps: UserProps = {
    firstName: 'Firstname',
    lastName: 'Lastname',
    email: 'firstname@gmail.com',
    password: 'Strong123!',
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      providers: [
        CreateUserUseCase,
        AuthorizationRepository,
        {
          provide: UserRepository,
          useValue: {
            create: (props: UserProps) => {
              expect(bcrypt.compareSync(userProps.password, props.password))
                .toBeTruthy;
              return new User({ id: uuid, ...props });
            },
          },
        },
      ],
    }).compile();

    createUserUseCase = testModule.get<CreateUserUseCase>(CreateUserUseCase);
  });

  it('should create a user', async () => {
    const user = await createUserUseCase.execute(userProps);

    expect(user).toEqual({
      id: uuid,
      firstName: userProps.firstName,
      lastName: userProps.lastName,
      email: userProps.email,
    });
  });
});
