import { Test } from '@nestjs/testing';
import { User, UserProps } from 'src/entities/user.entity';
import { UserDataSource } from './user.datasource';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './user.schema';
import { ConfigModule } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UserDataSource', () => {
  let userDataSource: UserDataSource;
  let userModel: Model<UserModel>;

  const userProps: UserProps = {
    firstName: 'Firstname',
    lastName: 'Lastname',
    email: 'firstname@gmail.com',
    password: 'Strong123!',
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        MongooseModule.forRoot(process.env.DATABASE_URI, {
          dbName: process.env.DATABASE_NAME,
        }),
        MongooseModule.forFeature([
          {
            name: UserModel.name,
            schema: UserSchema,
          },
        ]),
      ],
      providers: [UserDataSource],
    }).compile();

    userDataSource = testModule.get<UserDataSource>(UserDataSource);
    userModel = (userDataSource as any).userModel;
  });

  afterEach(async () => {
    await userModel.deleteMany();
  });

  describe('create', () => {
    it('should create user in db', async () => {
      const user = await userDataSource.create(userProps);

      expect(user.constructor.name).toBe(User.name);
      expect(isUUID(user.id)).toBeTruthy;
      expect(user).toEqual({ id: user.id, ...userProps });
    });

    it('should throw an error if user email is already taken', async () => {
      await userModel.create(userProps);
      await expect(userDataSource.create(userProps)).rejects.toEqual(
        new HttpException('User already exists', HttpStatus.CONFLICT),
      );
    });
  });
});
