import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthorizationRepository } from './authorization.repository';
import * as bcrypt from 'bcrypt';
import { AccessTokenPayload } from 'src/entities/access-token.entity';
import { randomUUID } from 'crypto';

describe('AuthorizationRepository', () => {
  let authorizationRepository: AuthorizationRepository;
  let jwtService: JwtService;

  let secret: string;
  let expiresIn: string;

  const userPayload: AccessTokenPayload = {
    id: randomUUID(),
    firstName: 'Firstname',
    email: 'firstname@gmail.com',
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        JwtModule.register({}),
      ],
      providers: [AuthorizationRepository, JwtService],
    }).compile();

    jwtService = testModule.get<JwtService>(JwtService);
    authorizationRepository = testModule.get<AuthorizationRepository>(
      AuthorizationRepository,
    );

    secret = process.env.JWT_SECRET;
    expiresIn = process.env.JWT_EXPIRATION;
  });

  describe('encrypt', () => {
    it('should encrypt a string', () => {
      const data = 'any-data';

      const encryptedData = authorizationRepository.encrypt(data);

      expect(bcrypt.compareSync(data, encryptedData)).toBe(true);
    });
  });

  describe('compareEncryption', () => {
    it('should compare encryption', () => {
      const data = 'any-data';
      const encryptedData = bcrypt.hashSync(
        data,
        (authorizationRepository as any).saltRounds,
      );

      const comparison = authorizationRepository.compareEncryption(
        data,
        encryptedData,
      );

      expect(comparison).toBeTruthy;
    });
  });

  describe('createJWT', () => {
    it('should create JWT', async () => {
      const now = Math.trunc(new Date().getTime() / 1000);
      const day = 24 * 60 * 60;

      const jwt = authorizationRepository.createJWT(userPayload);

      const decodedJwt = jwtService.decode(jwt) as Record<string, string>;
      expect(decodedJwt).toEqual({
        ...userPayload,
        iat: now,
        exp: now + day,
      });
    });
  });

  describe('validateJWT', () => {
    it('should validate JWT and return payload', async () => {
      const jwt = jwtService.sign(userPayload, { secret, expiresIn });
      const now = Math.trunc(new Date().getTime() / 1000);
      const day = 24 * 60 * 60;

      const payload = authorizationRepository.validateJWT(jwt);

      expect(payload).toEqual({
        ...userPayload,
        iat: now,
        exp: now + day,
      });
    });

    it('should throw an error if JWT has expired', async () => {
      const jwt = jwtService.sign(userPayload, { secret, expiresIn: '-24h' });

      const payload = authorizationRepository.validateJWT(jwt);

      expect(payload).toBeNull;
    });
  });
});
