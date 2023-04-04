import { Injectable } from '@nestjs/common';
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
    const guest = await this.guestModel.findById(bookingProps.guest.id);

    const room = await this.roomModel
      .findById(bookingProps.room.id)
      .populate('hotel');

    const booking = new this.bookingModel({ ...bookingProps, guest, room });
    await booking.save();

    return mapBookingModel(booking);
  }

  async existOneWithOverlappingDatesByRoom(
    roomId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<boolean> {
    const booking = await this.bookingModel
      .findOne()
      .and([
        { room: roomId },
        { checkInAt: { $lt: endAt } },
        { checkOutAt: { $gt: startAt } },
      ]);

    return !!booking;
  }
}
