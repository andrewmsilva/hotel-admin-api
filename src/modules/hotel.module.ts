import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
  providers: [],
})
export class HotelModule {}
