import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from 'src/controllers/user.controller';
import { UserModel, UserSchema } from 'src/repositories/user/user.schema';
import { CreateUserUseCase } from 'src/usecases/create-user/create-user.usecase';
import { JwtModule } from '@nestjs/jwt';
import { UserRepository } from 'src/repositories/user/user.repository';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserRepository, CreateUserUseCase],
})
export class UserModule {}
