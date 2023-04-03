import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guest, GuestProps } from 'src/entities/guest.entity';
import { mapGuestModel } from './guest.mapper';
import { GuestModel } from './guest.schema';

@Injectable()
export class GuestRepository {
  constructor(
    @InjectModel(GuestModel.name) private guestModel: Model<GuestModel>,
  ) {}

  async create(guestProps: GuestProps): Promise<Guest> {
    const user = new this.guestModel(guestProps);

    try {
      await user.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException('Guest already exists', HttpStatus.CONFLICT);
      }
      throw error;
    }

    return mapGuestModel(user);
  }
}
