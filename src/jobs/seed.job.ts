import { NestFactory } from '@nestjs/core';
import { Model } from 'mongoose';
import { AppModule } from 'src/app.module';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { BookingModel } from 'src/repositories/booking/booking.schema';
import { GuestRepository } from 'src/repositories/guest/guest.repository';
import { GuestModel } from 'src/repositories/guest/guest.schema';
import { HotelRepository } from 'src/repositories/hotel/hotel.repository';
import { HotelModel } from 'src/repositories/hotel/hotel.schema';
import { RoomRepository } from 'src/repositories/room/room.repository';
import { RoomModel } from 'src/repositories/room/room.schema';
import { UserRepository } from 'src/repositories/user/user.repository';
import { UserModel } from 'src/repositories/user/user.schema';
import { Seed } from 'src/seeds/seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seed = new Seed();

  const userRepository = app.get(UserRepository);
  const userModel: Model<UserModel> = (userRepository as any).userModel;
  await userModel.create(seed.user.createProps());

  const guestRepository = app.get(GuestRepository);
  const guestModel: Model<GuestModel> = (guestRepository as any).guestModel;
  await guestModel.create(seed.guest.createProps());

  const hotelRepository = app.get(HotelRepository);
  const hotelModel: Model<HotelModel> = (hotelRepository as any).hotelModel;
  const hotel = await hotelModel.create(seed.hotel.createProps());

  const roomRepository = app.get(RoomRepository);
  const roomModel: Model<RoomModel> = (roomRepository as any).roomModel;
  await roomModel.create({ ...seed.room.createProps(), hotel });

  await app.close();
}
bootstrap();
