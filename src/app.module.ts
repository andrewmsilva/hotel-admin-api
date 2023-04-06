import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  BookingModel,
  BookingSchema,
} from './repositories/booking/booking.schema';
import { HotelModel, HotelSchema } from './repositories/hotel/hotel.schema';
import { RoomModel, RoomSchema } from './repositories/room/room.schema';
import { BookingController } from './controllers/booking.controller';
import { AuthorizationRepository } from './repositories/authorization/authorization.repository';
import { BookingRepository } from './repositories/booking/booking.repository';
import { RoomRepository } from './repositories/room/room.repository';
import { SignUpUserUseCase } from './usecases/user/sign-up-user/sign-up-user.usecase';
import { SignInUserUseCase } from './usecases/user/sign-in-user/sign-in-user.usecase';
import { UserController } from './controllers/user.controller';
import { UserRepository } from './repositories/user/user.repository';
import { HotelRepository } from './repositories/hotel/hotel.repository';
import { UserModel, UserSchema } from './repositories/user/user.schema';
import { MulterModule } from '@nestjs/platform-express';
import { CreateBookingUseCase } from './usecases/booking/create-booking/create-booking.usecase';
import { ConfirmBookingUseCase } from './usecases/booking/confirm-booking/confirm-booking.usecase';
import { SharingRepository } from './repositories/sharing/sharing.repository';
import { GetBookingConfirmationUseCase } from './usecases/booking/get-booking-confirmation/get-booking-confirmation.usecase';
import { AddToBalanceUseCase } from './usecases/user/add-to-balance/add-to-balance.usecase';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: !ENV ? '.env' : `.env.${ENV}` }),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DATABASE_NAME,
    }),
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: HotelModel.name, schema: HotelSchema },
      { name: RoomModel.name, schema: RoomSchema },
      { name: BookingModel.name, schema: BookingSchema },
    ]),
    MulterModule.register({ dest: process.env.FILE_STORAGE_PATH }),
  ],
  controllers: [UserController, BookingController],
  providers: [
    // Repositories
    AuthorizationRepository,
    SharingRepository,
    UserRepository,
    HotelRepository,
    RoomRepository,
    BookingRepository,
    // Usecases
    SignUpUserUseCase,
    SignInUserUseCase,
    AddToBalanceUseCase,
    CreateBookingUseCase,
    ConfirmBookingUseCase,
    GetBookingConfirmationUseCase,
  ],
})
export class AppModule {}
