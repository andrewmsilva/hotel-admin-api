import { Booking, BookingStatus } from 'src/entities/booking.entity';
import { GetBookingUseCase } from './get-booking.usecase';
import { Seed } from 'src/seeds/seed';
import { Test } from '@nestjs/testing';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { randomUUID } from 'crypto';
import { Hotel } from 'src/entities/hotel.entity';
import { Room } from 'src/entities/room.entity';
import { User } from 'src/entities/user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('GetBookingUseCase', () => {
  let getBookingUseCase: GetBookingUseCase;
  let existentBooking: Booking;
  let bookingId: string;
  let user: User;

  const seed = new Seed();

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        GetBookingUseCase,
        {
          provide: BookingRepository,
          useValue: {
            findOneByIdAndUser: () => existentBooking,
          },
        },
      ],
    }).compile();

    getBookingUseCase = testModule.get(GetBookingUseCase);

    const hotel = new Hotel({ ...seed.hotel.createProps(), id: randomUUID() });
    const room = new Room({
      ...seed.room.createProps(),
      id: randomUUID(),
      hotel,
    });

    user = new User({
      ...seed.user.createProps(),
      id: randomUUID(),
      balanceCents: 0,
    });

    existentBooking = new Booking({
      ...seed.booking.createProps(),
      id: randomUUID(),
      status: BookingStatus.Confirmed,
      user,
      room,
    });

    bookingId = existentBooking.id;
  });

  it('should get booking', async () => {
    const booking = await getBookingUseCase.execute({ bookingId }, user.id);

    expect(booking).toEqual(existentBooking);
  });

  it('should get booking', async () => {
    existentBooking = null;

    await expect(
      getBookingUseCase.execute({ bookingId }, user.id),
    ).rejects.toThrow(
      new HttpException('Booking not found', HttpStatus.NOT_FOUND),
    );
  });
});
