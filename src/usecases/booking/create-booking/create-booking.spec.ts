import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { CreateBookingUseCase } from './create-booking.usecase';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { GuestRepository } from 'src/repositories/guest/guest.repository';
import { RoomRepository } from 'src/repositories/room/room.repository';
import { Room } from 'src/entities/room.entity';
import { CreateBookingDTO } from './create-booking.dto';
import { Hotel } from 'src/entities/hotel.entity';
import { Booking } from 'src/entities/booking.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Seed } from 'src/seeds/seed';
import { Guest } from 'src/entities/guest.entity';

describe('CreateBookingUseCase', () => {
  let createBookingUseCase: CreateBookingUseCase;
  const seed = new Seed();

  let existentGuest: Guest;
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
          provide: GuestRepository,
          useValue: { findOneById: () => existentGuest },
        },
        {
          provide: RoomRepository,
          useValue: { findOneById: () => existentRoom },
        },
      ],
    }).compile();

    existentGuest = new Guest({
      id: randomUUID(),
      ...seed.guest.createProps(),
    });

    existentRoom = new Room({
      id: randomUUID(),
      ...seed.room.createProps(),
      hotel: new Hotel({ id: randomUUID(), ...seed.hotel.createProps() }),
    });

    const props = seed.booking.createProps();
    bookingProps = {
      roomId: existentRoom.id,
      guestId: existentGuest.id,
      checkInAt: props.checkInAt,
      checkOutAt: props.checkOutAt,
    };

    createdBooking = new Booking({
      id: randomUUID(),
      room: existentRoom,
      guest: existentGuest,
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
    const booking = await createBookingUseCase.execute(bookingProps);

    expect(booking).toEqual(createdBooking);
  });

  it('should throw conflict error if room is unavailable', async () => {
    throwOverlappingError = true;

    await expect(createBookingUseCase.execute(bookingProps)).rejects.toThrow(
      new HttpException(
        'Room is unavailable in the chosen date interval',
        HttpStatus.CONFLICT,
      ),
    );
  });

  it('should throw not found error if guest does not exist', async () => {
    existentGuest = null;

    await expect(createBookingUseCase.execute(bookingProps)).rejects.toThrow(
      new HttpException('Guest not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should throw not found error if room does not exist', async () => {
    existentRoom = null;

    await expect(createBookingUseCase.execute(bookingProps)).rejects.toThrow(
      new HttpException('Room not found', HttpStatus.NOT_FOUND),
    );
  });
});