import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { Room } from 'src/entities/room.entity';
import { HotelModel } from '../hotel/hotel.schema';
import { BookingModel } from '../booking/booking.schema';

@Schema({ collection: 'rooms', optimisticConcurrency: true })
export class RoomModel implements Omit<Room, 'id' | 'hotel' | 'bookings'> {
  @Prop({ required: true, default: randomUUID })
  _id: string;

  @Prop({ required: true, type: Types.ObjectId, ref: HotelModel.name })
  @Type(() => HotelModel)
  hotel: HotelModel;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  identifier: string;

  @Prop({ required: true })
  maxGuests: number;

  @Prop()
  basePriceCents?: number;

  @Prop({ required: true })
  priceCents: number;

  @Prop({
    required: true,
    type: () => [Types.ObjectId],
    ref: BookingModel.name,
    default: [],
  })
  bookings: BookingModel[];
}

export const RoomSchema = SchemaFactory.createForClass(RoomModel);
