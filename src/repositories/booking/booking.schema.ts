import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { Booking, BookingStatus } from 'src/entities/booking.entity';
import { UserModel } from '../user/user.schema';

@Schema({ collection: 'bookings' })
export class BookingModel implements Omit<Booking, 'id' | 'user' | 'room'> {
  @Prop({ required: true, default: randomUUID })
  _id: string;

  @Prop({ required: true, type: Types.ObjectId, ref: UserModel.name })
  @Type(() => UserModel)
  user: UserModel;

  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.Created })
  status: BookingStatus;

  @Prop()
  receiptFileName?: string;

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
