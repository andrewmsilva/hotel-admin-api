import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from 'src/controllers/user/user.controller';
import { UserProvider } from 'src/data/user/user.provider';
import { UserModel, UserSchema } from 'src/data/user/user.schema';
import { UserRepository } from 'src/repositories/user.repository';

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
  providers: [UserProvider, UserRepository],
})
export class UserModule {}
