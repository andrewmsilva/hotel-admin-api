import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomProps } from 'src/entities/room.entity';
import { HotelModel } from '../hotel/hotel.schema';
import { mapRoomModel } from './room.mapper';
import { RoomModel } from './room.schema';

@Injectable()
export class RoomRepository {
  constructor(
    @InjectModel(HotelModel.name) private hotelModel: Model<HotelModel>,
    @InjectModel(RoomModel.name) private roomModel: Model<RoomModel>,
  ) {}

  async create(roomProps: RoomProps): Promise<Room> {
    const hotel = await this.hotelModel.findById(roomProps.hotel?.id);
    if (!hotel) {
      throw new HttpException('Hotel not found', HttpStatus.NOT_FOUND);
    }

    const room = new this.roomModel({ ...roomProps, hotel });
    await room.save();

    return mapRoomModel(room);
  }
}
