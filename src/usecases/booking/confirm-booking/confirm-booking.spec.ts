import { Test } from '@nestjs/testing';
import { ConfirmBookingUseCase } from './confirm-booking.usecase';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { ConfirmBookingDTO } from './confirm-booking.dto';

describe('CreateBookingUseCase', () => {
  let addReceiptUseCase: ConfirmBookingUseCase;
  let setBookingAsConfirmed: boolean;

  const receiptProps: ConfirmBookingDTO = {
    bookingId: 'uuid-here',
    fileName: 'file-name',
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        ConfirmBookingUseCase,
        {
          provide: BookingRepository,
          useValue: {
            setReceiptById: () => setBookingAsConfirmed,
          },
        },
      ],
    }).compile();

    addReceiptUseCase = testModule.get<ConfirmBookingUseCase>(
      ConfirmBookingUseCase,
    );

    setBookingAsConfirmed = true;
  });

  it('should add receipt and confirm booking', async () => {
    const isConfirmed = await addReceiptUseCase.execute(receiptProps);

    expect(isConfirmed).toBe(true);
  });

  it('should return false if booking does not exist', async () => {
    setBookingAsConfirmed = false;

    const isConfirmed = await addReceiptUseCase.execute(receiptProps);

    expect(isConfirmed).toBe(false);
  });
});
