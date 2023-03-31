import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from 'src/controllers/user.controller';
import { UserRepository } from 'src/repositories/user/user.repository';
import { UserModel, UserSchema } from 'src/repositories/user/user.schema';
import { CreateUserUseCase } from 'src/usecases/create-user/create-user.usecase';

@Module({
  imports: [
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
