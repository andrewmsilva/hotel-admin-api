import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { Hotel } from 'src/entities/hotel.entity';
import { HotelModel, HotelSchema } from '../hotel/hotel.schema';
import { HotelRepository } from '../hotel/hotel.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { BookingModel, BookingSchema } from './booking.schema';
import { Booking, BookingProps } from 'src/entities/booking.entity';
import { RoomModel, RoomSchema } from '../room/room.schema';
import { GuestModel, GuestSchema } from '../guest/guest.schema';
import { RoomRepository } from '../room/room.repository';
import { GuestRepository } from '../guest/guest.repository';
import { Room } from 'src/entities/room.entity';
import { Gender, Guest } from 'src/entities/guest.entity';
import { DateTime } from 'luxon';

describe('BookingRepository', () => {
  let bookingRepository: BookingRepository;
  let hotelModel: Model<HotelModel>;
  let roomModel: Model<RoomModel>;
  let guestModel: Model<GuestModel>;
  let bookingModel: Model<BookingModel>;

  let hotel: Hotel;
  let room: Room;
  let guest: Guest;
  let bookingProps: BookingProps;

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
          { name: GuestModel.name, schema: GuestSchema },
          { name: BookingModel.name, schema: BookingSchema },
        ]),
      ],
      providers: [
        HotelRepository,
        RoomRepository,
        GuestRepository,
        BookingRepository,
      ],
    }).compile();

    const hotelRepository = testModule.get<HotelRepository>(HotelRepository);
    hotelModel = (hotelRepository as any).hotelModel;
    hotel = await hotelRepository.create({
      name: 'Hotel Name',
      stars: 4.5,
      email: 'hotel@gmail.com',
      phone: '+5511922223333',
      address: 'Rua Abobrinha, 123, Cidade',
    });

    const roomRepository = testModule.get<RoomRepository>(RoomRepository);
    roomModel = (roomRepository as any).roomModel;
    room = await roomRepository.create({
      hotelId: hotel.id,
      name: 'Room Name',
      identifier: '1203',
      maxGuests: 2,
      oldPriceCents: 18000,
      priceCents: 13000,
    });

    const guestRepository = testModule.get<GuestRepository>(GuestRepository);
    guestModel = (guestRepository as any).guestModel;
    guest = await guestRepository.create({
      firstName: 'Firstname',
      lastName: 'Lastname',
      email: 'firstname@gmail.com',
      phone: '+5511922223333',
      gender: Gender.Other,
    });

    bookingRepository = testModule.get<BookingRepository>(BookingRepository);
    bookingModel = (bookingRepository as any).bookingModel;
    bookingProps = {
      roomId: room.id,
      guestId: guest.id,
      checkInAt: DateTime.now().toJSDate(),
      checkOutAt: DateTime.now().plus({ days: 5 }).toJSDate(),
    };
  });

  afterEach(async () => {
    await bookingModel.deleteMany();
    await guestModel.deleteMany();
    await roomModel.deleteMany();
    await hotelModel.deleteMany();
  });

  describe('create', () => {
    it('should create booking in db', async () => {
      const booking = await bookingRepository.create(bookingProps);

      expect(booking.constructor.name).toBe(Booking.name);
      expect(isUUID(booking.id)).toBeTruthy;
      expect(booking).toEqual({
        id: booking.id,
        guest,
        room,
        checkInAt: bookingProps.checkInAt,
        checkOutAt: bookingProps.checkOutAt,
      });
    });

    it('should throw an error if guest does not exist', async () => {
      await expect(
        bookingRepository.create({
          ...bookingProps,
          guestId: 'other-uuid-here',
        }),
      ).rejects.toThrow(
        new HttpException('Guest not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if room does not exist', async () => {
      await expect(
        bookingRepository.create({
          ...bookingProps,
          roomId: 'other-uuid-here',
        }),
      ).rejects.toThrow(
        new HttpException('Room not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if guest is missing', async () => {
      await expect(
        bookingRepository.create({ ...bookingProps, guestId: null }),
      ).rejects.toThrow(
        new HttpException('Guest not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if room is missing', async () => {
      await expect(
        bookingRepository.create({ ...bookingProps, roomId: null }),
      ).rejects.toThrow(
        new HttpException('Room not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('existOneWithOverlappingDatesByRoom', () => {
    let existentBooking: BookingModel;
    let startAt: Date;
    let endAt: Date;

    beforeEach(async () => {
      const existentGuest = await guestModel.findById(guest.id);
      const existentRoom = await roomModel.findById(room.id).populate('hotel');

      existentBooking = await bookingModel.create({
        ...bookingProps,
        guest: existentGuest,
        room: existentRoom,
      });

      startAt = existentBooking.checkInAt;
      endAt = existentBooking.checkOutAt;
    });

    it('should return true if given interval is exactly the same', async () => {
      const isRoomAvailable =
        await bookingRepository.existOneWithOverlappingDatesByRoom(
          room.id,
          startAt,
          endAt,
        );

      expect(isRoomAvailable).toBe(true);
    });

    it('should return true if given interval is overlapping from left', async () => {
      startAt = DateTime.fromJSDate(startAt).minus({ days: 2 }).toJSDate();
      endAt = DateTime.fromJSDate(endAt).minus({ days: 2 }).toJSDate();

      const isRoomAvailable =
        await bookingRepository.existOneWithOverlappingDatesByRoom(
          room.id,
          startAt,
          endAt,
        );

      expect(isRoomAvailable).toBe(true);
    });

    it('should return true if given interval is overlapping from right', async () => {
      startAt = DateTime.fromJSDate(startAt).plus({ days: 2 }).toJSDate();
      endAt = DateTime.fromJSDate(endAt).plus({ days: 2 }).toJSDate();

      const isRoomAvailable =
        await bookingRepository.existOneWithOverlappingDatesByRoom(
          room.id,
          startAt,
          endAt,
        );

      expect(isRoomAvailable).toBe(true);
    });

    it('should return false if given interval is touching the left', async () => {
      startAt = DateTime.fromJSDate(startAt).minus({ days: 5 }).toJSDate();
      endAt = DateTime.fromJSDate(endAt).minus({ days: 5 }).toJSDate();

      const isRoomAvailable =
        await bookingRepository.existOneWithOverlappingDatesByRoom(
          room.id,
          startAt,
          endAt,
        );

      expect(isRoomAvailable).toBe(false);
    });

    it('should return false if given interval is touching the right', async () => {
      startAt = DateTime.fromJSDate(startAt).plus({ days: 5 }).toJSDate();
      endAt = DateTime.fromJSDate(endAt).plus({ days: 5 }).toJSDate();

      const isRoomAvailable =
        await bookingRepository.existOneWithOverlappingDatesByRoom(
          room.id,
          startAt,
          endAt,
        );

      expect(isRoomAvailable).toBe(false);
    });

    it('should return false if room does not exist', async () => {
      const isRoomAvailable =
        await bookingRepository.existOneWithOverlappingDatesByRoom(
          'other-uuid-here',
          startAt,
          endAt,
        );

      expect(isRoomAvailable).toBe(false);
    });
  });
});
