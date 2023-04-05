import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { Booking } from 'src/entities/booking.entity';
import { GuestModel } from '../guest/guest.schema';

@Schema({ collection: 'bookings' })
export class BookingModel implements Omit<Booking, 'id' | 'guest' | 'room'> {
  @Prop({ required: true, default: randomUUID })
  _id: string;

  @Prop({ required: true, type: Types.ObjectId, ref: GuestModel.name })
  @Type(() => GuestModel)
  guest: GuestModel;

  @Prop({ required: true })
  checkInAt: Date;

  @Prop({ required: true })
  checkOutAt: Date;

  @Prop({ required: true })
  priceCents: number;

  @Prop({ required: true })
  totalCents: number;
}

export const BookingSchema = SchemaFactory.createForClass(BookingModel);
