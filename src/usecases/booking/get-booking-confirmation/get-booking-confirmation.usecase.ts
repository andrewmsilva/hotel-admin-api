import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import * as fs from 'fs';
import { GetBookingConfirmationDTO } from './get-booking-confirmation.dto';

@Injectable()
export class GetBookingConfirmationUseCase {
  async execute({ id }: GetBookingConfirmationDTO): Promise<Readable> {
    const pdfPath = `${process.env.FILE_STORAGE_PATH}/${id}.pdf`;

    if (!fs.existsSync(pdfPath)) {
      throw new HttpException('Booking not found', HttpStatus.NOT_FOUND);
    }

    const stream = fs.createReadStream(pdfPath);

    return stream;
  }
}
