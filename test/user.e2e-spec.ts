import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { UserRepository } from 'src/repositories/user/user.repository';
import { UserModel } from 'src/repositories/user/user.schema';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let userModel: Model<UserModel>;

  const userProps = {
    firstName: 'Firstname',
    lastName: 'Lastname',
    email: 'firstname@gmail.com',
    password: 'Strong123!',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = app.get<UserRepository>(UserRepository);
    userModel = (userRepository as any).userModel;
  });

  afterEach(async () => {
    await userModel.deleteMany();
  });

  describe('/user (POST)', () => {
    it('should create user', async () => {
      const res = await request(app.getHttpServer())
        .post('/user')
        .send(userProps)
        .expect(201);

      const user = res.body;

      expect(isUUID(user.id)).toBeTruthy;
      expect(user).toEqual({
        id: user.id,
        ...userProps,
        password: user.password,
      });
    });

    it('should throw conflict error if user email is already taken', async () => {
      await userModel.create(userProps);
      await request(app.getHttpServer())
        .post('/user')
        .send(userProps)
        .expect(409)
        .expect({ statusCode: 409, message: 'User already exists' });
    });

    it('should throw validation error if firstName is empty', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .send({ ...userProps, firstName: '' })
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['firstName should not be empty'],
          error: 'Bad Request',
        });
    });

    it('should throw validation error if lastName is empty', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .send({ ...userProps, lastName: '' })
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['lastName should not be empty'],
          error: 'Bad Request',
        });
    });

    it('should throw validation error if email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .send({ ...userProps, email: 'test@test' })
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['email must be an email'],
          error: 'Bad Request',
        });
    });

    it('should throw validation error if password is not strong', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .send({ ...userProps, password: 'Strong?' })
        .expect(400)
        .expect({
          statusCode: 400,
          message: ['password is not strong enough'],
          error: 'Bad Request',
        });
    });
  });
});
