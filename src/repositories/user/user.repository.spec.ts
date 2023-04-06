import { Test } from '@nestjs/testing';
import { User } from 'src/entities/user.entity';
import { UserRepository } from './user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserSchema } from './user.schema';
import { ConfigModule } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Seed } from 'src/seeds/seed';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let userModel: Model<UserModel>;

  const seed = new Seed();
  const userProps = seed.user.createProps();

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
        JwtModule.register({}),
      ],
      providers: [UserRepository],
    }).compile();

    userRepository = testModule.get<UserRepository>(UserRepository);
    userModel = (userRepository as any).userModel;
  });

  afterEach(async () => {
    await userModel.deleteMany();
  });

  describe('create', () => {
    it('should create user in db', async () => {
      const user = await userRepository.create(userProps);

      checkUser(user);
    });

    it('should return null if user email is already taken', async () => {
      await userModel.create(userProps);

      const user = await userRepository.create(userProps);

      expect(user).toBeNull;
    });
  });

  describe('findOneByEmailWithPassword', () => {
    it('should find user with valid credentials', async () => {
      await userModel.create(userProps);

      const [user, encryptedPassword] =
        await userRepository.findOneByEmailWithPassword(userProps.email);

      expect(encryptedPassword).toBe(userProps.password);
      checkUser(user);
    });

    it('should return null if user email is incorrect', async () => {
      await userModel.create(userProps);

      const user = await userRepository.findOneByEmailWithPassword(
        'incorrect@email.com',
      );

      expect(user).toBeNull;
    });
  });
  describe('findOneById', () => {
    it('should find user by id', async () => {
      const existentUser = await userModel.create(userProps);

      const user = await userRepository.findOneById(existentUser._id);

      checkUser(user);
    });

    it('should return null if user does not exist', async () => {
      const user = await userRepository.findOneById('uuid-here');

      expect(user).toBeNull;
    });
  });

  function checkUser(user: User) {
    expect(user).toBeInstanceOf(User);
    expect(isUUID(user.id)).toBe(true);
    expect(user).toEqual({
      id: user.id,
      firstName: userProps.firstName,
      lastName: userProps.lastName,
      email: userProps.email,
      phone: userProps.phone,
      gender: userProps.gender,
    });
  }
});
