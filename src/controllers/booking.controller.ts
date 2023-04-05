import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Booking } from 'src/entities/booking.entity';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { CreateBookingDTO } from 'src/usecases/booking/create-booking.dto';
import { CreateBookingUseCase } from 'src/usecases/booking/create-booking.usecase';

@Controller('booking')
export class BookingController {
  constructor(private readonly createBookingUseCase: CreateBookingUseCase) {}

  @UseGuards(AuthorizationGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() bookingProps: CreateBookingDTO): Promise<Booking> {
    return this.createBookingUseCase.execute(bookingProps);
  }
}
