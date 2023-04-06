import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Seed } from 'src/seeds/seed';
import { MulterModule } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { Booking, BookingStatus } from 'src/entities/booking.entity';
import { Hotel } from 'src/entities/hotel.entity';
import { Room } from 'src/entities/room.entity';
import { SharingRepository } from 'src/repositories/sharing/sharing.repository';
import { GetBookingConfirmationUseCase } from './get-booking-confirmation.usecase';
import { Readable } from 'stream';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from 'src/entities/user.entity';

describe('GetBookingConfirmation', () => {
  let getBookingConfirmationUseCase: GetBookingConfirmationUseCase;
  let sharingRepository: SharingRepository;
  let booking: Booking;

  const seed = new Seed();

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        MulterModule.register({ dest: process.env.FILE_STORAGE_PATH }),
      ],
      providers: [SharingRepository, GetBookingConfirmationUseCase],
    }).compile();

    sharingRepository = testModule.get<SharingRepository>(SharingRepository);
    getBookingConfirmationUseCase =
      testModule.get<GetBookingConfirmationUseCase>(
        GetBookingConfirmationUseCase,
      );

    const user = new User({ ...seed.user.createProps(), id: randomUUID() });
    const hotel = new Hotel({ ...seed.hotel.createProps(), id: randomUUID() });
    const room = new Room({
      ...seed.room.createProps(),
      id: randomUUID(),
      hotel,
    });

    booking = new Booking({
      ...seed.booking.createProps(),
      id: randomUUID(),
      status: BookingStatus.Confirmed,
      user,
      room,
    });

    await sharingRepository.createBookingConfirmationPdf(booking);
  });

  it('should get pdf stream', async () => {
    const stream = await getBookingConfirmationUseCase.execute(booking);

    expect(stream).toBeInstanceOf(Readable);
  });

  it('should get invalid pdf stream if booking does not exist', async () => {
    await expect(
      getBookingConfirmationUseCase.execute({ id: 'uuid-here' }),
    ).rejects.toThrow(
      new HttpException('Booking not found', HttpStatus.NOT_FOUND),
    );
  });
});
