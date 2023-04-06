import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Booking } from 'src/entities/booking.entity';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { GetBookingDTO } from './get-booking.dto';

@Injectable()
export class GetBookingUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute({ id }: GetBookingDTO, userId: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOneByIdAndUser(id, userId);

    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }

    return booking;
  }
}
