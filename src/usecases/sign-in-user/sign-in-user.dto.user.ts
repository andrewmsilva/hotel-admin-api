import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SignInUserDTO {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
