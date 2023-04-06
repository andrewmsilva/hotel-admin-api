import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user/user.repository';
import { CheckInDTO } from './check-in.dto';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { Booking, BookingStatus } from 'src/entities/booking.entity';

@Injectable()
export class CheckInUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute({ bookingId }: CheckInDTO, userId: string): Promise<Booking> {
    let user = await this.userRepository.findOneById(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    let booking = await this.bookingRepository.findOneByIdAndUser(
      bookingId,
      userId,
    );

    if (!booking) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }

    user = await this.userRepository.findOneAndAddToBalance(
      userId,
      booking.totalCents,
    );

    if (!user) {
      throw new HttpException(
        "User don't have enough balance",
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    booking = await this.bookingRepository.findOneByIdAndSetStatus(
      bookingId,
      BookingStatus.Concluded,
    );

    return booking;
  }
}
