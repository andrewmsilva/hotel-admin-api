import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { Hotel } from 'src/entities/hotel.entity';
import { HotelModel, HotelSchema } from '../hotel/hotel.schema';
import { HotelRepository } from '../hotel/hotel.repository';
import { BookingRepository } from './booking.repository';
import { BookingModel, BookingSchema } from './booking.schema';
import {
  Booking,
  BookingProps,
  BookingStatus,
} from 'src/entities/booking.entity';
import { RoomModel, RoomSchema } from '../room/room.schema';
import { RoomRepository } from '../room/room.repository';
import { Room } from 'src/entities/room.entity';
import { DateTime } from 'luxon';
import { Seed } from 'src/seeds/seed';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserModel, UserSchema } from '../user/user.schema';
import { User } from 'src/entities/user.entity';
import { UserRepository } from '../user/user.repository';
import { randomUUID } from 'crypto';

describe('BookingRepository', () => {
  let bookingRepository: BookingRepository;
  let hotelModel: Model<HotelModel>;
  let roomModel: Model<RoomModel>;
  let userModel: Model<UserModel>;
  let bookingModel: Model<BookingModel>;

  let hotel: Hotel;
  let room: Room;
  let user: User;
  let bookingProps: BookingProps;
  let existentBooking: BookingModel;

  const seed = new Seed();

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        MongooseModule.forRoot(process.env.DATABASE_URI, {
          dbName: process.env.DATABASE_NAME,
        }),
        MongooseModule.forFeature([
          { name: HotelModel.name, schema: HotelSchema },
          { name: RoomModel.name, schema: RoomSchema },
          { name: UserModel.name, schema: UserSchema },
          { name: BookingModel.name, schema: BookingSchema },
        ]),
      ],
      providers: [
        HotelRepository,
        RoomRepository,
        UserRepository,
        BookingRepository,
      ],
    }).compile();

    const hotelRepository = testModule.get(HotelRepository);
    hotelModel = (hotelRepository as any).hotelModel;
    hotel = await hotelRepository.create(seed.hotel.createProps());

    const roomRepository = testModule.get(RoomRepository);
    roomModel = (roomRepository as any).roomModel;
    room = await roomRepository.create(
      seed.room.createProps({ hotelId: hotel.id }),
    );

    const userRepository = testModule.get(UserRepository);
    userModel = (userRepository as any).userModel;
    user = await userRepository.create(seed.user.createProps());

    bookingRepository = testModule.get(BookingRepository);
    bookingModel = (bookingRepository as any).bookingModel;
    bookingProps = seed.booking.createProps({
      roomId: room.id,
      userId: user.id,
    });
  });

  afterEach(async () => {
    await bookingModel.deleteMany();
    await userModel.deleteMany();
    await roomModel.deleteMany();
    await hotelModel.deleteMany();
  });

  describe('createWithoutOverlapping', () => {
    const overlappingError = new HttpException(
      'Room is unavailable in the chosen date interval',
      HttpStatus.CONFLICT,
    );

    describe('creation tests', () => {
      it('should create booking in db', async () => {
        const booking = await bookingRepository.createWithoutOverlapping(
          bookingProps,
        );

        checkBooking(booking);
      });

      it('should try to create many similar bookings at the same time, but only create one', async () => {
        const bookingPromises = await Promise.allSettled<Booking>([
          bookingRepository.createWithoutOverlapping(bookingProps),
          bookingRepository.createWithoutOverlapping(bookingProps),
          bookingRepository.createWithoutOverlapping(bookingProps),
          bookingRepository.createWithoutOverlapping(bookingProps),
          bookingRepository.createWithoutOverlapping(bookingProps),
        ]);

        const fulfilledIndex = bookingPromises.findIndex(
          (bookingPromise) => bookingPromise.status === 'fulfilled',
        );
        checkBooking((bookingPromises[fulfilledIndex] as any).value);

        bookingPromises.map((bookingPromise, index) => {
          if (index !== fulfilledIndex) {
            expect(bookingPromise.status).toBe('rejected');
          }
        });

        expect(await bookingModel.count()).toBe(1);
      });
    });

    describe('overlapping tests', () => {
      beforeEach(async () => {
        const existentUser = await userModel.findById(user.id);

        existentBooking = await bookingModel.create({
          ...bookingProps,
          user: existentUser,
        });

        await roomModel.findOneAndUpdate(
          { _id: room.id },
          { $push: { bookings: existentBooking } },
        );
      });

      it('should return null if given interval is exactly the same', async () => {
        await expect(
          bookingRepository.createWithoutOverlapping(bookingProps),
        ).rejects.toThrow(overlappingError);
      });

      it('should return null if given interval is overlapping from left', async () => {
        bookingProps.checkInAt = DateTime.fromJSDate(bookingProps.checkInAt)
          .minus({ days: 2 })
          .toJSDate();
        bookingProps.checkOutAt = DateTime.fromJSDate(bookingProps.checkOutAt)
          .minus({ days: 2 })
          .toJSDate();

        await expect(
          bookingRepository.createWithoutOverlapping(bookingProps),
        ).rejects.toThrow(overlappingError);
      });

      it('should return null if given interval is overlapping from right', async () => {
        bookingProps.checkInAt = DateTime.fromJSDate(bookingProps.checkInAt)
          .plus({ days: 2 })
          .toJSDate();
        bookingProps.checkOutAt = DateTime.fromJSDate(bookingProps.checkOutAt)
          .plus({ days: 2 })
          .toJSDate();

        await expect(
          bookingRepository.createWithoutOverlapping(bookingProps),
        ).rejects.toThrow(overlappingError);
      });

      it('should create booking if given interval is touching the left', async () => {
        bookingProps.checkInAt = DateTime.fromJSDate(bookingProps.checkInAt)
          .minus({ days: 5 })
          .toJSDate();
        bookingProps.checkOutAt = DateTime.fromJSDate(bookingProps.checkOutAt)
          .minus({ days: 5 })
          .toJSDate();

        const booking = await bookingRepository.createWithoutOverlapping(
          bookingProps,
        );

        checkBooking(booking);
      });

      it('should create booking if given interval is touching the right', async () => {
        bookingProps.checkInAt = DateTime.fromJSDate(bookingProps.checkInAt)
          .plus({ days: 5 })
          .toJSDate();
        bookingProps.checkOutAt = DateTime.fromJSDate(bookingProps.checkOutAt)
          .plus({ days: 5 })
          .toJSDate();

        const booking = await bookingRepository.createWithoutOverlapping(
          bookingProps,
        );

        checkBooking(booking);
      });
    });
  });

  describe('findOneByIdAndSetReceipt', () => {
    const receiptFileName = 'receipt-file-name';

    beforeEach(async () => {
      const existentUser = await userModel.findById(user.id);

      existentBooking = await bookingModel.create({
        ...bookingProps,
        user: existentUser,
      });

      await roomModel.findOneAndUpdate(
        { _id: room.id },
        { $push: { bookings: existentBooking } },
      );
    });

    it('should set booking receipt and chage its status to Confirmed', async () => {
      const booking = await bookingRepository.findOneByIdAndSetReceipt(
        existentBooking._id,
        receiptFileName,
      );

      checkBooking(booking, BookingStatus.Confirmed);
    });

    it('should return false if booking does not exist', async () => {
      const booking = await bookingRepository.findOneByIdAndSetReceipt(
        'other-uuid-here',
        receiptFileName,
      );

      expect(booking).toBeNull;
    });
  });

  describe('findOneByIdAndUser', () => {
    beforeEach(async () => {
      const existentUser = await userModel.findById(user.id);

      existentBooking = await bookingModel.create({
        ...bookingProps,
        user: existentUser,
      });

      await roomModel.findOneAndUpdate(
        { _id: room.id },
        { $push: { bookings: existentBooking } },
      );
    });

    it('should find booking by id', async () => {
      const booking = await bookingRepository.findOneByIdAndUser(
        existentBooking._id,
        user.id,
      );

      checkBooking(booking);
    });

    it('should return null if booking does not exist', async () => {
      await bookingModel.deleteMany();

      const booking = await bookingRepository.findOneByIdAndUser(
        existentBooking._id,
        user.id,
      );

      expect(booking).toBeNull;
    });

    it('should return null if booking does not belongs to this user', async () => {
      const booking = await bookingRepository.findOneByIdAndUser(
        existentBooking._id,
        randomUUID(),
      );

      expect(booking).toBeNull;
    });
  });

  describe('findOneByIdAndSetStatus', () => {
    const newStatus = BookingStatus.Concluded;

    beforeEach(async () => {
      const existentUser = await userModel.findById(user.id);

      existentBooking = await bookingModel.create({
        ...bookingProps,
        user: existentUser,
      });

      await roomModel.findOneAndUpdate(
        { _id: room.id },
        { $push: { bookings: existentBooking } },
      );
    });

    it('should find booking by id', async () => {
      const booking = await bookingRepository.findOneByIdAndSetStatus(
        existentBooking._id,
        newStatus,
      );

      checkBooking(booking, newStatus);
    });

    it('should return null if booking does not exist', async () => {
      await bookingModel.deleteMany();

      const booking = await bookingRepository.findOneByIdAndSetStatus(
        existentBooking._id,
        newStatus,
      );

      expect(booking).toBeNull;
    });
  });

  function checkBooking(booking: Booking, status = BookingStatus.Created) {
    expect(booking).toBeInstanceOf(Booking);
    expect(isUUID(booking.id)).toBe(true);
    expect(booking).toEqual({
      id: booking.id,
      user,
      room,
      status,
      checkInAt: bookingProps.checkInAt,
      checkOutAt: bookingProps.checkOutAt,
      priceCents: bookingProps.priceCents,
      totalCents: bookingProps.totalCents,
    });
  }
});
