import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingProps } from 'src/entities/booking.entity';
import { GuestModel } from '../guest/guest.schema';
import { RoomModel } from '../room/room.schema';
import { mapBookingModel } from './booking.mapper';
import { BookingModel } from './booking.schema';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectModel(GuestModel.name) private guestModel: Model<GuestModel>,
    @InjectModel(RoomModel.name) private roomModel: Model<RoomModel>,
    @InjectModel(BookingModel.name) private bookingModel: Model<BookingModel>,
  ) {}

  async create(bookingProps: BookingProps): Promise<Booking> {
    const guest = await this.guestModel.findById(bookingProps.guestId);
    if (!guest) {
      throw new HttpException('Guest not found', HttpStatus.NOT_FOUND);
    }

    const room = await this.roomModel
      .findById(bookingProps.roomId)
      .populate('hotel');
    if (!room) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }

    const booking = new this.bookingModel({ ...bookingProps, guest, room });
    await booking.save();

    return mapBookingModel(booking);
  }
}
