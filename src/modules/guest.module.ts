import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuestRepository } from 'src/repositories/guest/guest.repository';
import { GuestModel, GuestSchema } from 'src/repositories/guest/guest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GuestModel.name,
        schema: GuestSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [GuestRepository],
})
export class GuestModule {}
