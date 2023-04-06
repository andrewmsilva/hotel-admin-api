import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { Model } from 'mongoose';
import { AuthorizationRepository } from 'src/repositories/authorization/authorization.repository';
import { HotelModel } from 'src/repositories/hotel/hotel.schema';
import { RoomModel } from 'src/repositories/room/room.schema';
import { GuestModel } from 'src/repositories/guest/guest.schema';
import { BookingModel } from 'src/repositories/booking/booking.schema';
import { HotelRepository } from 'src/repositories/hotel/hotel.repository';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { GuestRepository } from 'src/repositories/guest/guest.repository';
import { RoomRepository } from 'src/repositories/room/room.repository';
import { randomUUID } from 'crypto';
import { Seed } from 'src/seeds/seed';
import { Hotel } from 'src/entities/hotel.entity';
import { Room } from 'src/entities/room.entity';
import { Guest } from 'src/entities/guest.entity';
import { isUUID } from 'class-validator';
import { DateTime } from 'luxon';
import { CreateBookingDTO } from 'src/usecases/booking/create-booking/create-booking.dto';
import { Booking, BookingStatus } from 'src/entities/booking.entity';
import * as path from 'path';
import { SharingRepository } from 'src/repositories/sharing/sharing.repository';

describe('BookingController (e2e)', () => {
  let app: INestApplication;
  const seed = new Seed();

  let authorizationRepository: AuthorizationRepository;
  let bookingRepository: BookingRepository;
  let hotelModel: Model<HotelModel>;
  let roomModel: Model<RoomModel>;
  let guestModel: Model<GuestModel>;
  let bookingModel: Model<BookingModel>;

  let accessToken: string;
  let hotel: Hotel;
  let room: Room;
  let guest: Guest;
  let bookingDto: CreateBookingDTO;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    authorizationRepository = app.get<AuthorizationRepository>(
      AuthorizationRepository,
    );
    accessToken =
      'Bearer ' +
      authorizationRepository.createJWT({
        id: randomUUID(),
        firstName: 'Firstname',
        email: 'firstname@gmail.com',
      });

    const hotelRepository = app.get<HotelRepository>(HotelRepository);
    hotel = await hotelRepository.create(seed.hotel.createProps());
    hotelModel = (hotelRepository as any).hotelModel;

    const roomRepository = app.get<RoomRepository>(RoomRepository);
    room = await roomRepository.create(
      seed.room.createProps({ hotelId: hotel.id }),
    );
    roomModel = (roomRepository as any).roomModel;

    const guestRepository = app.get<GuestRepository>(GuestRepository);
    guest = await guestRepository.create(seed.guest.createProps());
    guestModel = (guestRepository as any).guestModel;

    bookingRepository = app.get<BookingRepository>(BookingRepository);
    bookingModel = (bookingRepository as any).bookingModel;
    bookingDto = {
      ...seed.booking.createProps(),
      roomId: room.id,
      guestId: guest.id,
    };
  });

  afterEach(async () => {
    await bookingModel.deleteMany();
    await guestModel.deleteMany();
    await roomModel.deleteMany();
    await hotelModel.deleteMany();
  });

  describe('/booking (POST)', () => {
    function createBookingRequest() {
      return request(app.getHttpServer())
        .post('/booking')
        .set('Authorization', accessToken);
    }

    it('should book a room', async () => {
      const res = await createBookingRequest()
        .send(bookingDto)
        .expect(HttpStatus.CREATED);

      const booking = res.body;

      checkBooking(booking);
    });

    it('should book a room once and throw concurrency error when booking at the same time', async () => {
      const responses = await Promise.all([
        createBookingRequest().send(bookingDto),
        createBookingRequest().send(bookingDto),
        createBookingRequest().send(bookingDto),
        createBookingRequest().send(bookingDto),
      ]);

      let fulfilledCount = 0;
      let rejectedCount = 0;

      responses.map((res) => {
        if (res.status === HttpStatus.CREATED) {
          fulfilledCount++;
          const booking = res.body;

          checkBooking(booking);
        } else {
          rejectedCount++;
          expect(res.body.statusCode).toBe(HttpStatus.CONFLICT);
        }
      });

      expect(fulfilledCount).toBe(1);
      expect(rejectedCount).toBe(responses.length - 1);
    });

    it('should throw conflict error if date interval is overlapping another booking', async () => {
      await bookingRepository.createWithoutOverlapping(
        seed.booking.createProps({
          roomId: room.id,
          guestId: guest.id,
          checkInAt: DateTime.fromJSDate(bookingDto.checkInAt)
            .minus({ days: 2 })
            .toJSDate(),
          checkOutAt: DateTime.fromJSDate(bookingDto.checkOutAt)
            .plus({ days: 2 })
            .toJSDate(),
        }),
      );

      await createBookingRequest()
        .send(bookingDto)
        .expect(HttpStatus.CONFLICT)
        .expect({
          statusCode: HttpStatus.CONFLICT,
          message: 'Room is unavailable in the chosen date interval',
        });
    });

    it('should throw not found error if guest does not exist', async () => {
      await guestModel.deleteMany();

      await createBookingRequest()
        .send(bookingDto)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Guest not found',
        });
    });

    it('should throw not found error if room does not exist', async () => {
      await roomModel.deleteMany();

      await createBookingRequest()
        .send(bookingDto)
        .expect(HttpStatus.NOT_FOUND)
        .expect({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Room not found',
        });
    });

    it('should throw unauthorized error if user is not signed in', async () => {
      await createBookingRequest()
        .set('Authorization', null)
        .send(bookingDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        });
    });
  });

  describe('/booking/confirm (PUT)', () => {
    const receiptJpg = path.resolve(
      __dirname,
      './receipt-examples/receipt.jpg',
    );
    const receiptJpeg = path.resolve(
      __dirname,
      './receipt-examples/receipt.jpeg',
    );
    const receiptPng = path.resolve(
      __dirname,
      './receipt-examples/receipt.png',
    );
    const receiptPdf = path.resolve(
      __dirname,
      './receipt-examples/receipt.pdf',
    );

    let existentBooking: BookingModel;

    beforeEach(async () => {
      const existentGuest = await guestModel.findById(guest.id);

      existentBooking = await bookingModel.create({
        ...seed.booking.createProps(),
        guest: existentGuest,
      });

      await roomModel.findOneAndUpdate(
        { _id: room.id },
        { $push: { bookings: existentBooking } },
      );
    });

    function creatingConfirmRequest() {
      return request(app.getHttpServer())
        .put('/booking/confirm')
        .set('Authorization', accessToken)
        .field('bookingId', existentBooking._id);
    }

    it('should send receipt in JPG and confirm booking', async () => {
      const res = await creatingConfirmRequest()
        .attach('receipt', receiptJpg)
        .expect(HttpStatus.OK);

      const booking = res.body;
      checkBooking(booking, BookingStatus.Confirmed);
    });

    it('should send receipt in JPEG and confirm booking', async () => {
      const res = await creatingConfirmRequest()
        .attach('receipt', receiptJpeg)
        .expect(HttpStatus.OK);

      const booking = res.body;
      checkBooking(booking, BookingStatus.Confirmed);
    });

    it('should send receipt in PNG and confirm booking', async () => {
      const res = await creatingConfirmRequest()
        .attach('receipt', receiptPng)
        .expect(HttpStatus.OK);

      const booking = res.body;
      checkBooking(booking, BookingStatus.Confirmed);
    });

    it('should send receipt in PDF and confirm booking', async () => {
      const res = await creatingConfirmRequest()
        .attach('receipt', receiptPdf)
        .expect(HttpStatus.OK);

      const booking = res.body;
      checkBooking(booking, BookingStatus.Confirmed);
    });
  });

  describe('/booking/confirm (GET)', () => {
    let existentBooking: Booking;

    beforeEach(async () => {
      existentBooking = new Booking({
        ...seed.booking.createProps(),
        id: randomUUID(),
        status: BookingStatus.Confirmed,
        guest,
        room,
      });

      const sharingRepository = app.get<SharingRepository>(SharingRepository);
      await sharingRepository.createBookingConfirmationPdf(existentBooking);
    });

    it('should download generated pdf', async () => {
      const res = await request(app.getHttpServer())
        .get('/booking/confirm/' + existentBooking.id)
        .set('Authorization', accessToken)
        .expect(HttpStatus.OK);

      expect(res.headers['content-type']).toBe('application/pdf');
    });

    it('should throw bad request error if given id is invalid', async () => {
      await request(app.getHttpServer())
        .get('/booking/confirm/uuid-here')
        .set('Authorization', accessToken)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw not found error if file does not exist', async () => {
      await request(app.getHttpServer())
        .get('/booking/confirm/' + randomUUID())
        .set('Authorization', accessToken)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  function checkBooking(booking: Booking, status = BookingStatus.Created) {
    expect(isUUID(booking.id)).toBe(true);
    expect(booking).toEqual({
      id: booking.id,
      room: { ...room, hotel: { ...hotel } },
      guest: { ...guest },
      status,
      checkInAt: bookingDto.checkInAt.toISOString(),
      checkOutAt: bookingDto.checkOutAt.toISOString(),
      priceCents: room.priceCents,
      totalCents: room.priceCents * seed.booking.bookingDays,
    });
  }
});
