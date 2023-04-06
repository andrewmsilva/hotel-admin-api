import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Seed } from 'src/seeds/seed';
import { SharingRepository } from './sharing.repository';
import { MulterModule } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { Booking, BookingStatus } from 'src/entities/booking.entity';
import { Guest } from 'src/entities/guest.entity';
import { Hotel } from 'src/entities/hotel.entity';
import { Room } from 'src/entities/room.entity';

describe('SharingRepository', () => {
  let sharingRepository: SharingRepository;
  let booking: Booking;

  const seed = new Seed();

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        MulterModule.register({ dest: process.env.FILE_STORAGE_PATH }),
      ],
      providers: [SharingRepository],
    }).compile();

    sharingRepository = testModule.get<SharingRepository>(SharingRepository);

    const guest = new Guest({ ...seed.guest.createProps(), id: randomUUID() });
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
      guest,
      room,
    });
  });

  describe('createBookingConfirmationPdf', () => {
    it('should create pdf', async () => {
      await sharingRepository.createBookingConfirmationPdf(booking);
    });
  });
});
