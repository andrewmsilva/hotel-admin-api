import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelRepository } from 'src/repositories/hotel/hotel.repository';
import { HotelModel, HotelSchema } from 'src/repositories/hotel/hotel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: HotelModel.name,
        schema: HotelSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [HotelRepository],
})
export class HotelModule {}
