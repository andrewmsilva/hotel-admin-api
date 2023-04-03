import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModel, RoomSchema } from 'src/repositories/room/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RoomModel.name,
        schema: RoomSchema,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class RoomModule {}
