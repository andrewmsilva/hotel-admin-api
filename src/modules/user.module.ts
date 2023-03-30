import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from 'src/controllers/user.controller';
import { UserDataSource } from 'src/data/user/user.datasource';
import { UserModel, UserSchema } from 'src/data/user/user.schema';
import { UserRepository } from 'src/repositories/user.repository';
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
  providers: [UserDataSource, UserRepository, CreateUserUseCase],
})
export class UserModule {}
