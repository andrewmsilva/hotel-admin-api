import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { Booking } from 'src/entities/booking.entity';
import { GuestModel } from '../guest/guest.schema';
import { RoomModel } from '../room/room.schema';

@Schema({ collection: 'bookings' })
export class BookingModel implements Omit<Booking, 'id' | 'guest' | 'room'> {
  @Prop({ required: true, default: randomUUID })
  _id: string;

  @Prop({ type: Types.ObjectId, ref: GuestModel.name })
  @Type(() => GuestModel)
  guest: GuestModel;

  @Prop({ type: Types.ObjectId, ref: RoomModel.name })
  @Type(() => RoomModel)
  room: RoomModel;

  @Prop({ required: true })
  checkInAt: Date;

  @Prop({ required: true })
  checkOutAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(BookingModel);
