import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { CreateBookingUseCase } from './create-booking.usecase';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { RoomRepository } from 'src/repositories/room/room.repository';
import { Room } from 'src/entities/room.entity';
import { CreateBookingDTO } from './create-booking.dto';
import { Hotel } from 'src/entities/hotel.entity';
import { Booking, BookingStatus } from 'src/entities/booking.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Seed } from 'src/seeds/seed';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user/user.repository';

describe('CreateBookingUseCase', () => {
  let createBookingUseCase: CreateBookingUseCase;
  const seed = new Seed();

  let existentUser: User;
  let existentRoom: Room;
  let createdBooking: Booking;
  let throwOverlappingError: boolean;

  let bookingProps: CreateBookingDTO;

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        CreateBookingUseCase,
        {
          provide: BookingRepository,
          useValue: {
            createWithoutOverlapping: () => {
              if (throwOverlappingError) {
                throw new HttpException(
                  'Room is unavailable in the chosen date interval',
                  HttpStatus.CONFLICT,
                );
              }
              return createdBooking;
            },
          },
        },
        {
          provide: UserRepository,
          useValue: { findOneById: () => existentUser },
        },
        {
          provide: RoomRepository,
          useValue: { findOneById: () => existentRoom },
        },
      ],
    }).compile();

    existentUser = new User({
      id: randomUUID(),
      balanceCents: 0,
      ...seed.user.createProps(),
    });

    existentRoom = new Room({
      id: randomUUID(),
      ...seed.room.createProps(),
      hotel: new Hotel({ id: randomUUID(), ...seed.hotel.createProps() }),
    });

    const props = seed.booking.createProps();
    bookingProps = {
      roomId: existentRoom.id,
      checkInAt: props.checkInAt,
      checkOutAt: props.checkOutAt,
    };

    createdBooking = new Booking({
      id: randomUUID(),
      room: existentRoom,
      user: existentUser,
      status: BookingStatus.Created,
      checkInAt: bookingProps.checkInAt,
      checkOutAt: bookingProps.checkOutAt,
      priceCents: existentRoom.priceCents,
      totalCents: existentRoom.priceCents * seed.booking.bookingDays,
    });

    throwOverlappingError = false;

    createBookingUseCase =
      testModule.get<CreateBookingUseCase>(CreateBookingUseCase);
  });

  it('should create a booking if room is available', async () => {
    const booking = await createBookingUseCase.execute(
      bookingProps,
      existentUser.id,
    );

    expect(booking).toEqual(createdBooking);
  });

  it('should throw conflict error if room is unavailable', async () => {
    throwOverlappingError = true;

    await expect(
      createBookingUseCase.execute(bookingProps, existentUser.id),
    ).rejects.toThrow(
      new HttpException(
        'Room is unavailable in the chosen date interval',
        HttpStatus.CONFLICT,
      ),
    );
  });

  it('should throw not found error if user does not exist', async () => {
    existentUser = null;

    await expect(
      createBookingUseCase.execute(bookingProps, 'uuid-here'),
    ).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should throw not found error if room does not exist', async () => {
    existentRoom = null;

    await expect(
      createBookingUseCase.execute(bookingProps, existentUser.id),
    ).rejects.toThrow(
      new HttpException('Room not found', HttpStatus.NOT_FOUND),
    );
  });
});
