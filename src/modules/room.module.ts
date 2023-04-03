import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomRepository } from 'src/repositories/room/room.repository';
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
  providers: [RoomRepository],
})
export class RoomModule {}
