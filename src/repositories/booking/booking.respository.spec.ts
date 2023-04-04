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
import { Room, RoomStatus } from 'src/entities/room.entity';
import { Gender, Guest } from 'src/entities/guest.entity';

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
      status: RoomStatus.Available,
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
      startAt: new Date(),
      endAt: new Date(),
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
        startAt: bookingProps.startAt,
        endAt: bookingProps.endAt,
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
});
