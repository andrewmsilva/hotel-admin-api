import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserSessionPayload } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';

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

  createJWT(payload: UserSessionPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiration,
    });
  }

  validateJWT(jwt: string): UserSessionPayload {
    try {
      return this.jwtService.verify<UserSessionPayload>(jwt, {
        secret: this.jwtSecret,
      });
    } catch (error) {
      return null;
    }
  }
}
