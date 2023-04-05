import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GuestRepository } from './guest.repository';
import { GuestModel, GuestSchema } from './guest.schema';
import { Guest } from 'src/entities/guest.entity';
import { Seed } from 'src/seeds/seed';

describe('GuestRepository', () => {
  let guestRepository: GuestRepository;
  let guestModel: Model<GuestModel>;

  const seed = new Seed();
  const guestProps = seed.guest.createProps();

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        MongooseModule.forRoot(process.env.DATABASE_URI, {
          dbName: process.env.DATABASE_NAME,
        }),
        MongooseModule.forFeature([
          { name: GuestModel.name, schema: GuestSchema },
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

      checkGuest(guest);
    });

    it('should throw an error if guest email is already taken', async () => {
      await guestModel.create(guestProps);

      await expect(guestRepository.create(guestProps)).rejects.toEqual(
        new HttpException('Guest already exists', HttpStatus.CONFLICT),
      );
    });
  });

  describe('findOneById', () => {
    it('should find guest by id', async () => {
      const existentGuest = await guestModel.create(guestProps);

      const guest = await guestRepository.findOneById(existentGuest._id);

      checkGuest(guest);
    });

    it('should return null if guest does not exist', async () => {
      const guest = await guestRepository.findOneById('other-uuid-here');

      expect(guest).toBeNull;
    });
  });

  function checkGuest(guest: Guest) {
    expect(guest.constructor.name).toBe(Guest.name);
    expect(isUUID(guest.id)).toBe(true);
    expect(guest).toEqual({
      id: guest.id,
      firstName: guestProps.firstName,
      lastName: guestProps.lastName,
      email: guestProps.email,
      phone: guestProps.phone,
      gender: guestProps.gender,
    });
  }
});
