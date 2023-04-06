import { Booking, BookingStatus } from 'src/entities/booking.entity';
import { CheckInUseCase } from './check-in.usecase';
import { Seed } from 'src/seeds/seed';
import { Test } from '@nestjs/testing';
import { User } from 'src/entities/user.entity';
import { randomUUID } from 'crypto';
import { Hotel } from 'src/entities/hotel.entity';
import { Room } from 'src/entities/room.entity';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { UserRepository } from 'src/repositories/user/user.repository';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CheckInUseCase', () => {
  let checkInUseCase: CheckInUseCase;
  let existentBooking: Booking;
  let updatedBooking: Booking;
  let user: User;
  let updatedUser: User;

  const seed = new Seed();

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        CheckInUseCase,
        {
          provide: UserRepository,
          useValue: {
            findOneById: () => user,
            findOneAndAddToBalance: () => updatedUser,
          },
        },
        {
          provide: BookingRepository,
          useValue: {
            findOneByIdAndUser: () => existentBooking,
            findOneByIdAndSetStatus: () => updatedBooking,
          },
        },
      ],
    }).compile();

    checkInUseCase = testModule.get(CheckInUseCase);

    const hotel = new Hotel({ ...seed.hotel.createProps(), id: randomUUID() });
    const room = new Room({
      ...seed.room.createProps(),
      id: randomUUID(),
      hotel,
    });

    const userProps = {
      ...seed.user.createProps(),
      id: randomUUID(),
      balanceCents: 0,
    };

    const bookingProps = {
      ...seed.booking.createProps(),
      id: randomUUID(),
      status: BookingStatus.Confirmed,
      user,
      room,
    };

    user = new User({ ...userProps, balanceCents: bookingProps.totalCents });
    updatedUser = new User(userProps);

    existentBooking = new Booking(bookingProps);
    updatedBooking = new Booking({
      ...bookingProps,
      user: updatedUser,
      status: BookingStatus.Concluded,
    });
  });

  it('should check in, update user balance, and update booking status', async () => {
    const booking = await checkInUseCase.execute(
      { bookingId: existentBooking.id },
      user.id,
    );

    expect(booking).toEqual(updatedBooking);
    expect(booking.user.balanceCents).toBe(0);
  });

  it('should throw not found error if user does not exist', async () => {
    user = null;

    await expect(
      checkInUseCase.execute({ bookingId: existentBooking.id }, updatedUser.id),
    ).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should throw not found error if booking does not exist', async () => {
    existentBooking = null;

    await expect(
      checkInUseCase.execute({ bookingId: updatedBooking.id }, user.id),
    ).rejects.toThrow(
      new HttpException('Booking not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should throw bad request error if booking status is Created', async () => {
    existentBooking.status = BookingStatus.Created;

    await expect(
      checkInUseCase.execute({ bookingId: updatedBooking.id }, user.id),
    ).rejects.toThrow(
      new HttpException('Booking is not confirmed yet', HttpStatus.BAD_REQUEST),
    );
  });

  it('should throw not found error if booking does not exist', async () => {
    existentBooking.status = BookingStatus.Concluded;

    await expect(
      checkInUseCase.execute({ bookingId: updatedBooking.id }, user.id),
    ).rejects.toThrow(
      new HttpException(
        'Booking is already checked in',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should throw not found error if user does not exist', async () => {
    updatedUser = null;

    await expect(
      checkInUseCase.execute({ bookingId: existentBooking.id }, user.id),
    ).rejects.toThrow(
      new HttpException(
        "User don't have enough balance",
        HttpStatus.PAYMENT_REQUIRED,
      ),
    );
  });
});
