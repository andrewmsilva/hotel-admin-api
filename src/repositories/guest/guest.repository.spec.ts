import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GuestRepository } from './guest.repository';
import { GuestModel, GuestSchema } from './guest.schema';
import { Gender, Guest, GuestProps } from 'src/entities/guest.entity';

describe('GuestRepository', () => {
  let guestRepository: GuestRepository;
  let guestModel: Model<GuestModel>;

  const guestProps: GuestProps = {
    firstName: 'Firstname',
    lastName: 'Lastname',
    email: 'firstname@gmail.com',
    phone: '+5511922223333',
    gender: Gender.Other,
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        MongooseModule.forRoot(process.env.DATABASE_URI, {
          dbName: process.env.DATABASE_NAME,
        }),
        MongooseModule.forFeature([
          {
            name: GuestModel.name,
            schema: GuestSchema,
          },
        ]),
      ],
      providers: [GuestRepository],
    }).compile();

    guestRepository = testModule.get<GuestRepository>(GuestRepository);
    guestModel = (guestRepository as any).guestModel;
  });

  afterEach(async () => {
    await guestModel.deleteMany();
  });

  describe('create', () => {
    it('should create guest in db', async () => {
      const guest = await guestRepository.create(guestProps);

      expect(guest.constructor.name).toBe(Guest.name);
      expect(isUUID(guest.id)).toBeTruthy;
      expect(guest).toEqual({
        id: guest.id,
        firstName: guestProps.firstName,
        lastName: guestProps.lastName,
        email: guestProps.email,
        phone: guestProps.phone,
        gender: guestProps.gender,
      });
    });

    it('should throw an error if guest email is already taken', async () => {
      await guestModel.create(guestProps);

      await expect(guestRepository.create(guestProps)).rejects.toEqual(
        new HttpException('Guest already exists', HttpStatus.CONFLICT),
      );
    });
  });
});
