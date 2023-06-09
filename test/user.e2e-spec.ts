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
import { Seed } from 'src/seeds/seed';
import { mapUserModel } from 'src/repositories/user/user.mapper';
import { User } from 'src/entities/user.entity';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authorizationRepository: AuthorizationRepository;
  let userModel: Model<UserModel>;

  const seed = new Seed();
  const userProps = seed.user.createProps({
    password: seed.user.defaultPassword,
  });

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

      expect(isJWT(accessToken)).toBe(true);
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

  describe('/user/sign-up (POST)', () => {
    it('should create user', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/sign-up')
        .send(userProps)
        .expect(HttpStatus.CREATED);

      const { accessToken }: AccessToken = res.body;
      expect(isJWT(accessToken)).toBe(true);

      const user = mapUserModel(await userModel.findOne());

      expect(isUUID(user.id)).toBe(true);
      expect({ ...user, password: seed.user.defaultPassword }).toEqual({
        id: user.id,
        balanceCents: 0,
        ...userProps,
      });
    });

    it('should throw conflict error if user email is already taken', async () => {
      await userModel.create(userProps);
      await request(app.getHttpServer())
        .post('/user/sign-up')
        .send(userProps)
        .expect(HttpStatus.CONFLICT)
        .expect({
          statusCode: HttpStatus.CONFLICT,
          message: 'User already exists',
        });
    });

    it('should throw validation error if firstName is empty', async () => {
      await request(app.getHttpServer())
        .post('/user/sign-up')
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
        .post('/user/sign-up')
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
        .post('/user/sign-up')
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
        .post('/user/sign-up')
        .send({ ...userProps, password: 'Strong?' })
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['password is not strong enough'],
          error: 'Bad Request',
        });
    });
  });

  describe('/user/balance (PUT)', () => {
    let existentUser: User;
    let accessToken: string;

    const balanceDto = { valueCents: 10000 };

    beforeEach(async () => {
      const userRepository = app.get<UserRepository>(UserRepository);
      existentUser = await userRepository.create(seed.user.createProps());

      accessToken =
        'Bearer ' +
        authorizationRepository.createJWT({
          id: existentUser.id,
          firstName: existentUser.firstName,
          email: existentUser.lastName,
        });
    });

    function addToBalanceRequest() {
      return request(app.getHttpServer())
        .put('/user/balance')
        .set('Authorization', accessToken)
        .send(balanceDto);
    }

    it('should add value to user balance', async () => {
      const res = await addToBalanceRequest().expect(HttpStatus.OK);

      const user = res.body;
      expect(user).toEqual({
        ...existentUser,
        balanceCents: balanceDto.valueCents,
      });
    });

    it('should throw not found error if user does not exist', async () => {
      await userModel.deleteMany();

      await addToBalanceRequest().expect(HttpStatus.NOT_FOUND).expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
      });
    });

    it('should throw not found error if user does not exist', async () => {
      await userModel.deleteMany();

      await addToBalanceRequest().expect(HttpStatus.NOT_FOUND).expect({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
      });
    });

    it('should throw unauthorized error if user is not signed in', async () => {
      await request(app.getHttpServer())
        .put('/user/balance')
        .send(balanceDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
