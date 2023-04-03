import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel, HotelProps } from 'src/entities/hotel.entity';
import { mapHotelModel } from './hotel.mapper';
import { HotelModel } from './hotel.schema';

@Injectable()
export class HotelRepository {
  constructor(
    @InjectModel(HotelModel.name) private hotelModel: Model<HotelModel>,
  ) {}

  async create(hotelProps: HotelProps): Promise<Hotel> {
    const hotel = new this.hotelModel(hotelProps);
    await hotel.save();

    return mapHotelModel(hotel);
  }
}
