import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Gender, Guest } from 'src/entities/guest.entity';

@Schema({ collection: 'guests' })
export class GuestModel implements Omit<Guest, 'id'> {
  @Prop({ required: true, default: randomUUID })
  _id: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, enum: Gender })
  gender: Gender;
}

export const GuestSchema = SchemaFactory.createForClass(GuestModel);
