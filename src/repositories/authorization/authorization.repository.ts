import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccessTokenPayload } from 'src/entities/access-token.entity';

@Injectable()
export class AuthorizationRepository {
  private saltRounds = 10;
  private jwtExpiration = '24h';
  private jwtSecret = process.env.JWT_SECRET;

  constructor(private jwtService: JwtService) {}

  encrypt(data: string): string {
    return bcrypt.hashSync(data, this.saltRounds);
  }

  compareEncryption(data: string, encryptedData: string): boolean {
    return bcrypt.compareSync(data, encryptedData);
  }

  createJWT(payload: AccessTokenPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiration,
    });
  }

  validateJWT(jwt: string): AccessTokenPayload {
    try {
      return this.jwtService.verify<AccessTokenPayload>(jwt, {
        secret: this.jwtSecret,
      });
    } catch (error) {
      return null;
    }
  }
}
