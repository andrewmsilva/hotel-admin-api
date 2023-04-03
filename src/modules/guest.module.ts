import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
  providers: [],
})
export class GuestModule {}
