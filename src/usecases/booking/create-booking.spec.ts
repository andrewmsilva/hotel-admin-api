import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import { CreateBookingUseCase } from './create-booking.usecase';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { GuestRepository } from 'src/repositories/guest/guest.repository';
import { RoomRepository } from 'src/repositories/room/room.repository';
import { Gender, Guest } from 'src/entities/guest.entity';
import { Room } from 'src/entities/room.entity';
import { CreateBookingDTO } from './create-booking.dto';
import { Hotel } from 'src/entities/hotel.entity';
import { Booking } from 'src/entities/booking.entity';
import { DateTime } from 'luxon';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CreateBookingUseCase', () => {
  let createBookingUseCase: CreateBookingUseCase;

  let existentGuest: Guest;
  let existentRoom: Room;
  let isRoomAvailable: boolean;
  let createdBooking: Booking;

  let bookingProps: CreateBookingDTO;

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        CreateBookingUseCase,
        {
          provide: BookingRepository,
          useValue: {
            create: () => createdBooking,
            existOneWithOverlappingDatesByRoom: () => isRoomAvailable,
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
      firstName: 'Firstname',
      lastName: 'Lastname',
      email: 'firstname@gmail.com',
      phone: '+5511922223333',
      gender: Gender.Other,
    });

    existentRoom = new Room({
      id: randomUUID(),
      name: 'Name',
      identifier: '1208',
      maxGuests: 2,
      oldPriceCents: 15000,
      priceCents: 12000,
      hotel: new Hotel({
        id: randomUUID(),
        name: 'Hotel Name',
        stars: 4.5,
        email: 'hotel@gmail.com',
        phone: '+5511922223333',
        address: 'Rua Abobrinha, 123, Cidade',
      }),
    });

    isRoomAvailable = true;

    bookingProps = {
      roomId: existentRoom.id,
      guestId: existentGuest.id,
      checkInAt: DateTime.now().plus({ days: 5 }).toJSDate(),
      checkOutAt: DateTime.now().plus({ days: 10 }).toJSDate(),
    };

    createdBooking = new Booking({
      id: randomUUID(),
      room: existentRoom,
      guest: existentGuest,
      checkInAt: bookingProps.checkInAt,
      checkOutAt: bookingProps.checkOutAt,
    });

    createBookingUseCase =
      testModule.get<CreateBookingUseCase>(CreateBookingUseCase);
  });

  it('should create a booking if room is available', async () => {
    const booking = await createBookingUseCase.execute(bookingProps);

    expect(booking).toEqual(createdBooking);
  });

  it('should throw conflict error if room is unavailable', async () => {
    isRoomAvailable = false;

    await expect(createBookingUseCase.execute(bookingProps)).rejects.toThrow(
      new HttpException(
        'Room is unavailable in the chosen time window',
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
