import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { isJWT, isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { UserRepository } from 'src/repositories/user/user.repository';
import { UserModel } from 'src/repositories/user/user.schema';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';
import { AccessToken } from 'src/entities/access-token.entity';
import { randomUUID } from 'crypto';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authorizationRepository: AuthorizationRepository;
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

    authorizationRepository = app.get<AuthorizationRepository>(
      AuthorizationRepository,
    );
    const userRepository = app.get<UserRepository>(UserRepository);
    userModel = (userRepository as any).userModel;
  });

  afterEach(async () => {
    await userModel.deleteMany();
  });

  describe('/user/sign-in (POST)', () => {
    const credentials = {
      email: userProps.email,
      password: userProps.password,
    };

    it('should sign in', async () => {
      const encryptedPassword = authorizationRepository.encrypt(
        userProps.password,
      );
      await userModel.create({ ...userProps, password: encryptedPassword });

      const res = await request(app.getHttpServer())
        .post('/user/sign-in')
        .send(credentials)
        .expect(HttpStatus.OK);

      const { accessToken }: AccessToken = res.body;

      expect(isJWT(accessToken)).toBeTruthy;
    });

    it('should throw unauthorized error if user email incorrect', async () => {
      await userModel.create(userProps);
      await request(app.getHttpServer())
        .post('/user/sign-in')
        .send({ ...credentials, email: 'incorrect@gmail.com' })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid credentials',
        });
    });

    it('should throw unauthorized error if user password incorrect', async () => {
      await userModel.create(userProps);
      await request(app.getHttpServer())
        .post('/user/sign-in')
        .send({ ...credentials, password: 'incorrectpassword' })
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid credentials',
        });
    });
  });

  describe('/user (POST)', () => {
    let accessToken: string;

    beforeEach(() => {
      accessToken =
        'Bearer ' +
        authorizationRepository.createJWT({
          id: randomUUID(),
          firstName: userProps.firstName,
          email: userProps.email,
        });
    });

    it('should create user', async () => {
      const res = await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', accessToken)
        .send(userProps)
        .expect(HttpStatus.CREATED);

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
        .set('Authorization', accessToken)
        .send(userProps)
        .expect(HttpStatus.CONFLICT)
        .expect({
          statusCode: HttpStatus.CONFLICT,
          message: 'User already exists',
        });
    });

    it('should throw validation error if firstName is empty', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', accessToken)
        .send({ ...userProps, firstName: '' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['firstName should not be empty'],
          error: 'Bad Request',
        });
    });

    it('should throw validation error if lastName is empty', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', accessToken)
        .send({ ...userProps, lastName: '' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['lastName should not be empty'],
          error: 'Bad Request',
        });
    });

    it('should throw validation error if email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', accessToken)
        .send({ ...userProps, email: 'test@test' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['email must be an email'],
          error: 'Bad Request',
        });
    });

    it('should throw validation error if password is not strong', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .set('Authorization', accessToken)
        .send({ ...userProps, password: 'Strong?' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['password is not strong enough'],
          error: 'Bad Request',
        });
    });

    it('should throw unauthoried error user is not signed in', async () => {
      await request(app.getHttpServer())
        .post('/user')
        .send(userProps)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        });
    });
  });
});
