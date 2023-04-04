import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BookingModel,
  BookingSchema,
} from 'src/repositories/booking/booking.schema';
import { GuestRepository } from 'src/repositories/guest/guest.repository';
import { GuestModel, GuestSchema } from 'src/repositories/guest/guest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GuestModel.name, schema: GuestSchema },
      { name: BookingModel.name, schema: BookingSchema },
    ]),
  ],
  controllers: [],
  providers: [GuestRepository],
})
export class GuestModule {}
