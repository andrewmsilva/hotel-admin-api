import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { User, UserProps } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user.repository';
import { CreateUserUseCase } from './create-user.usecase';
import * as bcrypt from 'bcrypt';

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
      providers: [
        CreateUserUseCase,
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
