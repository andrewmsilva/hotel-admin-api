import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Gender, User } from 'src/entities/user.entity';

@Schema({ collection: 'users' })
export class UserModel implements Omit<User, 'id'> {
  @Prop({ required: true, default: randomUUID })
  _id: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, enum: Gender })
  gender: Gender;

  @Prop({ required: true, default: 0 })
  balanceCents: number;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
