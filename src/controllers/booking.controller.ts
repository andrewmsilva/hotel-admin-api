import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  FileTypeValidator,
  ParseFilePipe,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Booking } from 'src/entities/booking.entity';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { ConfirmBookingDTO } from 'src/usecases/booking/confirm-booking/confirm-booking.dto';
import { ConfirmBookingUseCase } from 'src/usecases/booking/confirm-booking/confirm-booking.usecase';
import { CreateBookingDTO } from 'src/usecases/booking/create-booking/create-booking.dto';
import { CreateBookingUseCase } from 'src/usecases/booking/create-booking/create-booking.usecase';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly confirmBookingUseCase: ConfirmBookingUseCase,
  ) {}

  @UseGuards(AuthorizationGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBooking(@Body() bookingProps: CreateBookingDTO): Promise<Booking> {
    bookingProps.checkInAt = new Date(bookingProps.checkInAt);
    bookingProps.checkOutAt = new Date(bookingProps.checkOutAt);

    return this.createBookingUseCase.execute(bookingProps);
  }

  @UseGuards(AuthorizationGuard)
  @Put('confirm')
  @UseInterceptors(FileInterceptor('receipt'))
  @HttpCode(HttpStatus.OK)
  async confirmBooking(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf)$/ }),
        ],
      }),
    )
    receipt: Express.Multer.File,
    @Body() bookingProps: ConfirmBookingDTO,
  ): Promise<Booking> {
    return this.confirmBookingUseCase.execute({
      ...bookingProps,
      fileName: receipt.filename,
    });
  }
}
