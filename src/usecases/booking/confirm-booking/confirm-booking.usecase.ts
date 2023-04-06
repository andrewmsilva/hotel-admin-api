import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { ConfirmBookingDTO } from './confirm-booking.dto';
import { SharingRepository } from 'src/repositories/sharing/sharing.repository';
import { Booking } from 'src/entities/booking.entity';

@Injectable()
export class ConfirmBookingUseCase {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly sharingRepository: SharingRepository,
  ) {}

  async execute(receiptProps: ConfirmBookingDTO): Promise<Booking> {
    const booking = await this.bookingRepository.findOneByIdAndSetReceipt(
      receiptProps.bookingId,
      receiptProps.fileName,
    );

    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }

    await this.sharingRepository.createBookingConfirmationPdf(booking);

    return booking;
  }
}
