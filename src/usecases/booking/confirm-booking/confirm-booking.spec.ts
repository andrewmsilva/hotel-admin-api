import { Test } from '@nestjs/testing';
import { ConfirmBookingUseCase } from './confirm-booking.usecase';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { ConfirmBookingDTO } from './confirm-booking.dto';
import { SharingRepository } from 'src/repositories/sharing/sharing.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Booking } from 'src/entities/booking.entity';
import { Seed } from 'src/seeds/seed';
import { randomUUID } from 'crypto';
import { Room } from 'src/entities/room.entity';
import { Hotel } from 'src/entities/hotel.entity';
import { BookingStatus } from 'src/entities/booking.entity';
import { isUUID } from 'class-validator';
import { User } from 'src/entities/user.entity';

describe('CreateBookingUseCase', () => {
  let confirmBookingUseCase: ConfirmBookingUseCase;
  let updatedBooking: Booking;
  let receiptProps: ConfirmBookingDTO;

  const seed = new Seed();

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        ConfirmBookingUseCase,
        {
          provide: SharingRepository,
          useValue: {
            createBookingConfirmationPdf: () => null,
          },
        },
        {
          provide: BookingRepository,
          useValue: {
            findOneByIdAndSetReceipt: () => updatedBooking,
          },
        },
      ],
    }).compile();

    const user = new User({
      ...seed.user.createProps(),
      id: randomUUID(),
      balanceCents: 0,
    });
    const hotel = new Hotel({ ...seed.hotel.createProps(), id: randomUUID() });
    const room = new Room({
      ...seed.room.createProps(),
      id: randomUUID(),
      hotel,
    });

    updatedBooking = new Booking({
      ...seed.booking.createProps(),
      id: randomUUID(),
      status: BookingStatus.Confirmed,
      user,
      room,
    });

    confirmBookingUseCase = testModule.get<ConfirmBookingUseCase>(
      ConfirmBookingUseCase,
    );

    receiptProps = {
      bookingId: updatedBooking.id,
      fileName: 'file-name',
    };
  });

  it('should add receipt and confirm booking', async () => {
    const booking = await confirmBookingUseCase.execute(receiptProps);

    expect(booking).toBeInstanceOf(Booking);
    expect(isUUID(booking.id)).toBe(true);
    expect(booking).toEqual(updatedBooking);
  });

  it('should throw not found error if booking does not exist', async () => {
    updatedBooking = null;

    await expect(confirmBookingUseCase.execute(receiptProps)).rejects.toThrow(
      new HttpException('Booking not found', HttpStatus.NOT_FOUND),
    );
  });
});
