import { Injectable } from '@nestjs/common';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { ConfirmBookingDTO } from './confirm-booking.dto';

@Injectable()
export class ConfirmBookingUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(receiptProps: ConfirmBookingDTO): Promise<boolean> {
    const isConfirmed = await this.bookingRepository.setReceiptById(
      receiptProps.bookingId,
      receiptProps.fileName,
    );

    return isConfirmed;
  }
}
