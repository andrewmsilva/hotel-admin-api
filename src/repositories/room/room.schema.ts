import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { Room, RoomStatus } from 'src/entities/room.entity';
import { HotelModel } from '../hotel/hotel.schema';

@Schema({ collection: 'rooms' })
export class RoomModel implements Omit<Room, 'id' | 'hotel'> {
  @Prop({ required: true, default: randomUUID })
  _id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: HotelModel.name })
  @Type(() => HotelModel)
  hotel: HotelModel;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  identifier: string;

  @Prop({ required: true, enum: RoomStatus })
  status: RoomStatus;

  @Prop({ required: true })
  maxGuests: number;

  @Prop({ required: false })
  oldPriceCents?: number;

  @Prop({ required: true })
  priceCents: number;
}

export const RoomSchema = SchemaFactory.createForClass(RoomModel);
