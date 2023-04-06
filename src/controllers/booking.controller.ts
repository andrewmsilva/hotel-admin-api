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
  Get,
  Header,
  Res,
  Param,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AccessTokenPayload } from 'src/entities/access-token.entity';
import { Booking } from 'src/entities/booking.entity';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { ConfirmBookingDTO } from 'src/usecases/booking/confirm-booking/confirm-booking.dto';
import { ConfirmBookingUseCase } from 'src/usecases/booking/confirm-booking/confirm-booking.usecase';
import { CreateBookingDTO } from 'src/usecases/booking/create-booking/create-booking.dto';
import { CreateBookingUseCase } from 'src/usecases/booking/create-booking/create-booking.usecase';
import { GetBookingConfirmationDTO } from 'src/usecases/booking/get-booking-confirmation/get-booking-confirmation.dto';
import { GetBookingConfirmationUseCase } from 'src/usecases/booking/get-booking-confirmation/get-booking-confirmation.usecase';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly confirmBookingUseCase: ConfirmBookingUseCase,
    private readonly getBookingConfirmationUseCase: GetBookingConfirmationUseCase,
  ) {}

  @UseGuards(AuthorizationGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBooking(
    @Body() bookingProps: CreateBookingDTO,
    @Req() { user }: { user: AccessTokenPayload },
  ): Promise<Booking> {
    bookingProps.checkInAt = new Date(bookingProps.checkInAt);
    bookingProps.checkOutAt = new Date(bookingProps.checkOutAt);

    return this.createBookingUseCase.execute(bookingProps, user.id);
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

  @UseGuards(AuthorizationGuard)
  @Get('confirm/:id')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/pdf')
  async getBookingConfirmation(
    @Param() props: GetBookingConfirmationDTO,
    @Res() res: Response,
  ) {
    const stream = await this.getBookingConfirmationUseCase.execute(props);
    stream.pipe(res);
  }
}
