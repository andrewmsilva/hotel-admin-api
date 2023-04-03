import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { Booking } from 'src/entities/booking.entity';
import { GuestModel } from '../guest/guest.schema';
import { RoomModel } from '../room/room.schema';

@Schema({ collection: 'bookings' })
export class BookingModel implements Omit<Booking, 'id' | 'guest' | 'room'> {
  @Prop({ required: true, default: randomUUID })
  _id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: GuestModel.name })
  @Type(() => GuestModel)
  guest: GuestModel;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: RoomModel.name })
  @Type(() => RoomModel)
  room: RoomModel;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(BookingModel);
