import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user.module';
import { GuestModule } from './modules/guest.module';
import { HotelModule } from './modules/hotel.module';
import { RoomModule } from './modules/room.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: process.env.DATABASE_NAME,
    }),
    UserModule,
    GuestModule,
    HotelModule,
    RoomModule,
  ],
})
export class AppModule {}
