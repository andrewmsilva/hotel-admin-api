import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Booking } from 'src/entities/booking.entity';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { RoomRepository } from 'src/repositories/room/room.repository';
import { CreateBookingDTO } from './create-booking.dto';
import { DateTime } from 'luxon';
import { UserRepository } from 'src/repositories/user/user.repository';

@Injectable()
export class CreateBookingUseCase {
  constructor(
    private userRepository: UserRepository,
    private roomRepository: RoomRepository,
    private bookingRepository: BookingRepository,
  ) {}

  async execute(
    bookingDto: CreateBookingDTO,
    userId: string,
  ): Promise<Booking> {
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const room = await this.roomRepository.findOneById(bookingDto.roomId);
    if (!room) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }

    const checkInAt = DateTime.fromJSDate(bookingDto.checkInAt);
    const checkOutAt = DateTime.fromJSDate(bookingDto.checkOutAt);
    const bookingDays = Math.floor(checkOutAt.diff(checkInAt, 'days').days);

    const totalCents = bookingDays * room.priceCents;

    return this.bookingRepository.createWithoutOverlapping({
      ...bookingDto,
      userId,
      priceCents: room.priceCents,
      totalCents,
    });
  }
}
