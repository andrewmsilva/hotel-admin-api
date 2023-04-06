import { Test } from '@nestjs/testing';
import { ConfirmBookingUseCase } from './confirm-booking.usecase';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { ConfirmBookingDTO } from './confirm-booking.dto';
import { SharingRepository } from 'src/repositories/sharing/sharing.repository';
import { Readable } from 'stream';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Booking } from 'src/entities/booking.entity';
import { Seed } from 'src/seeds/seed';
import { Guest } from 'src/entities/guest.entity';
import { randomUUID } from 'crypto';
import { Room } from 'src/entities/room.entity';
import { Hotel } from 'src/entities/hotel.entity';
import { BookingStatus } from 'src/entities/booking.entity';

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
            createBookingConfirmationPdf: () => new Readable(),
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

    const guest = new Guest({ ...seed.guest.createProps(), id: randomUUID() });
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
      guest,
      room,
    });

    confirmBookingUseCase = testModule.get<ConfirmBookingUseCase>(
      ConfirmBookingUseCase,
    );

    receiptProps = {
      bookingId: 'uuid-here',
      roomId: 'uuid-here',
      fileName: 'file-name',
    };
  });

  it('should add receipt and confirm booking', async () => {
    const stream = await confirmBookingUseCase.execute(receiptProps);

    expect(stream._construct.name).toBe(Readable.name);
  });

  it('should throw not found error if booking does not exist', async () => {
    updatedBooking = null;

    await expect(confirmBookingUseCase.execute(receiptProps)).rejects.toThrow(
      new HttpException('Booking not found', HttpStatus.NOT_FOUND),
    );
  });
});
