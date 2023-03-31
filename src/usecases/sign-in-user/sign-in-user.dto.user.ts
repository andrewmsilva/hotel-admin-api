import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { UserCredentials } from 'src/entities/user.entity';

export class SignInUserDTO implements UserCredentials {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
