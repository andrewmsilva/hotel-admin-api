import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Booking } from 'src/entities/booking.entity';
import { BookingRepository } from 'src/repositories/booking/booking.repository';
import { GuestRepository } from 'src/repositories/guest/guest.repository';
import { RoomRepository } from 'src/repositories/room/room.repository';
import { CreateBookingDTO } from './create-booking.dto';

@Injectable()
export class CreateBookingUseCase {
  constructor(
    private guestRepository: GuestRepository,
    private roomRepository: RoomRepository,
    private bookingRepository: BookingRepository,
  ) {}

  async execute(bookingDto: CreateBookingDTO): Promise<Booking> {
    const guest = await this.guestRepository.findOneById(bookingDto.guestId);
    if (!guest) {
      throw new HttpException('Guest not found', HttpStatus.NOT_FOUND);
    }

    const room = await this.roomRepository.findOneById(bookingDto.roomId);
    if (!room) {
      throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
    }

    const isRoomAvailable =
      await this.bookingRepository.existOneWithOverlappingDatesByRoom(
        bookingDto.roomId,
        bookingDto.checkInAt,
        bookingDto.checkOutAt,
      );

    if (!isRoomAvailable) {
      throw new HttpException(
        'Room is unavailable in the chosen time window',
        HttpStatus.CONFLICT,
      );
    }

    return this.bookingRepository.create({ ...bookingDto, room, guest });
  }
}
