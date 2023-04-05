import { Test } from '@nestjs/testing';
import { AddReceiptUseCase } from './add-receipt.usecase';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { AddReceiptDTO } from './add-receipt.dto';

describe('CreateBookingUseCase', () => {
  let addReceiptUseCase: AddReceiptUseCase;
  let setBookingAsConfirmed: boolean;

  const receiptProps: AddReceiptDTO = {
    bookingId: 'uuid-here',
    fileName: 'file-name',
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        AddReceiptUseCase,
        {
          provide: BookingRepository,
          useValue: {
            setReceiptById: () => setBookingAsConfirmed,
          },
        },
      ],
    }).compile();

    addReceiptUseCase = testModule.get<AddReceiptUseCase>(AddReceiptUseCase);

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
