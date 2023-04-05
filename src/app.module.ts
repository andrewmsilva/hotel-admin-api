import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  BookingModel,
  BookingSchema,
} from './repositories/booking/booking.schema';
import { GuestModel, GuestSchema } from './repositories/guest/guest.schema';
import { HotelModel, HotelSchema } from './repositories/hotel/hotel.schema';
import { RoomModel, RoomSchema } from './repositories/room/room.schema';
import { BookingController } from './controllers/booking.controller';
import { AuthorizationRepository } from './repositories/authorization/authorization.repository';
import { BookingRepository } from './repositories/booking/booking.repository';
import { GuestRepository } from './repositories/guest/guest.repository';
import { RoomRepository } from './repositories/room/room.repository';
import { CreateUserUseCase } from './usecases/user/create-user/create-user.usecase';
import { SignInUserUseCase } from './usecases/user/sign-in-user/sign-in-user.usecase';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user/user.repository';
import { HotelRepository } from './repositories/hotel/hotel.repository';
import { UserModel, UserSchema } from './repositories/user/user.schema';
import { MulterModule } from '@nestjs/platform-express';
import { CreateBookingUseCase } from './usecases/booking/create-booking/create-booking.usecase';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DATABASE_NAME,
    }),
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: HotelModel.name, schema: HotelSchema },
      { name: RoomModel.name, schema: RoomSchema },
      { name: GuestModel.name, schema: GuestSchema },
      { name: BookingModel.name, schema: BookingSchema },
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UserController, BookingController],
  providers: [
    // Repositories
    AuthorizationRepository,
    UserRepository,
    GuestRepository,
    HotelRepository,
    RoomRepository,
    BookingRepository,
    // Usecases
    CreateUserUseCase,
    SignInUserUseCase,
    CreateBookingUseCase,
  ],
})
export class AppModule {}
