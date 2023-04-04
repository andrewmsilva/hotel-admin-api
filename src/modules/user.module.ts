import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from 'src/controllers/user.controller';
import { UserModel, UserSchema } from 'src/repositories/user/user.schema';
import { CreateUserUseCase } from 'src/usecases/user/create-user/create-user.usecase';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from 'src/repositories/user/user.repository';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';
import { SignInUserUseCase } from 'src/usecases/user/sign-in-user/sign-in-user.usecase';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    AuthorizationRepository,
    UserRepository,
    CreateUserUseCase,
    SignInUserUseCase,
  ],
})
export class UserModule {}
