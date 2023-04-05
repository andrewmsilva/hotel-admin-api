import { Injectable } from '@nestjs/common';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { AddReceiptDTO } from './add-receipt.dto';

@Injectable()
export class AddReceiptUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(receiptProps: AddReceiptDTO): Promise<boolean> {
    const isConfirmed = await this.bookingRepository.setReceiptById(
      receiptProps.bookingId,
      receiptProps.fileName,
    );

    return isConfirmed;
  }
}
