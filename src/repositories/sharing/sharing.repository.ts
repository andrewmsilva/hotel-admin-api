import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Booking } from 'src/entities/booking.entity';
import { Readable } from 'stream';

@Injectable()
export class SharingRepository {
  async createBookingConfirmationPdf(booking: Booking): Promise<Readable> {
    const confimationPdf = await PDFDocument.create();

    const timesRomanFont = await confimationPdf.embedFont(
      StandardFonts.TimesRoman,
    );
    const fontSize = 30;

    const page = confimationPdf.addPage();
    const { height } = page.getSize();

    page.drawText('Your booking has been confirmed!', {
      x: 95,
      y: height - 2 * fontSize,
      size: fontSize,
      font: timesRomanFont,
    });

    const stream = new Readable();

    stream.push(await confimationPdf.save());
    stream.push(null);

    return stream;
  }
}
