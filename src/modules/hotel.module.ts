import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelRepository } from 'src/repositories/hotel/hotel.repository';
import { HotelModel, HotelSchema } from 'src/repositories/hotel/hotel.schema';
import { RoomRepository } from 'src/repositories/room/room.repository';
import { RoomModel, RoomSchema } from 'src/repositories/room/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HotelModel.name, schema: HotelSchema },
      { name: RoomModel.name, schema: RoomSchema },
    ]),
  ],
  controllers: [],
  providers: [HotelRepository, RoomRepository],
})
export class HotelModule {}
