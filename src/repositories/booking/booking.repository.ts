import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Booking,
  BookingProps,
  BookingStatus,
} from 'src/entities/booking.entity';
import { RoomModel } from '../room/room.schema';
import { mapBookingModel } from './booking.mapper';
import { BookingModel } from './booking.schema';
import { UserModel } from '../user/user.schema';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
    @InjectModel(RoomModel.name) private roomModel: Model<RoomModel>,
    @InjectModel(BookingModel.name) private bookingModel: Model<BookingModel>,
  ) {}

  async createWithoutOverlapping(bookingProps: BookingProps): Promise<Booking> {
    const user = await this.userModel.findById(bookingProps.userId);

    // Get room if chosen time is not overlapping any other booking
    let room = await this.roomModel.findOne({
      _id: bookingProps.roomId,
      $nor: [
        {
          $and: [
            { 'bookings.checkInAt': { $lt: bookingProps.checkOutAt } },
            { 'bookings.checkOutAt': { $gt: bookingProps.checkInAt } },
          ],
        },
      ],
    });

    if (!room) {
      throw new HttpException(
        'Room is unavailable in the chosen date interval',
        HttpStatus.CONFLICT,
      );
    }

    const booking = await this.bookingModel.create({
      ...bookingProps,
      user,
    });

    room = await this.roomModel
      .findOneAndUpdate(
        { _id: bookingProps.roomId, __v: room.__v },
        { $push: { bookings: booking }, $inc: { __v: 1 } },
        { new: true },
      )
      .populate('hotel')
      .populate({ path: 'bookings.user', model: UserModel.name });

    if (!room) {
      await booking.deleteOne();
      throw new HttpException('Room state is not updated', HttpStatus.CONFLICT);
    }

    return mapBookingModel(room.bookings.at(-1), room);
  }

  async findOneByIdAndSetReceipt(
    bookingId: string,
    receiptFileName: string,
  ): Promise<Booking> {
    const room = await this.roomModel
      .findOne({ 'bookings._id': bookingId })
      .populate('hotel');

    if (!room) {
      return null;
    }

    const booking = await this.bookingModel
      .findOneAndUpdate(
        { _id: bookingId },
        { receiptFileName, status: BookingStatus.Confirmed },
        { new: true },
      )
      .populate('user');

    if (!booking) {
      return null;
    }

    return mapBookingModel(booking, room);
  }
}
