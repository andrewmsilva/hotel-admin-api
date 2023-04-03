import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Hotel } from 'src/entities/hotel.entity';

@Schema({ collection: 'hotels' })
export class HotelModel implements Omit<Hotel, 'id'> {
  @Prop({ required: true, default: randomUUID })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 1, max: 5 })
  stars: number;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;
}

export const HotelSchema = SchemaFactory.createForClass(HotelModel);
