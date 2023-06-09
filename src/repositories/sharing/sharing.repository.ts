import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Booking } from 'src/entities/booking.entity';
import * as fs from 'fs';

@Injectable()
export class SharingRepository {
  async createBookingConfirmationPdf(booking: Booking): Promise<void> {
    const room = booking.room;
    const hotel = room.hotel;
    const user = booking.user;

    const confimationPdf = await PDFDocument.create();

    const timesRomanFont = await confimationPdf.embedFont(
      StandardFonts.TimesRoman,
    );

    const page = confimationPdf.addPage();
    const { height } = page.getSize();

    const titleFontSize = 30;
    const subTitleFontSize = 20;
    const commonFontSize = 16;
    const top = height;

    page.drawText('Your booking has been confirmed!', {
      x: 95,
      y: top - 2 * titleFontSize,
      size: titleFontSize,
      font: timesRomanFont,
    });

    page.drawText('Guest information', {
      x: 95,
      y: top - 5 * subTitleFontSize,
      size: subTitleFontSize,
      font: timesRomanFont,
    });

    page.drawText(`${user.firstName} ${user.lastName}`, {
      x: 95,
      y: top - 8 * commonFontSize,
      size: commonFontSize,
      font: timesRomanFont,
    });

    page.drawText(`${user.email} / ${user.phone}`, {
      x: 95,
      y: top - 9 * commonFontSize,
      size: commonFontSize,
      font: timesRomanFont,
    });

    page.drawText('Hotel information', {
      x: 95,
      y: top - 9 * subTitleFontSize,
      size: subTitleFontSize,
      font: timesRomanFont,
    });

    page.drawText(`${hotel.name} - ${hotel.stars} stars`, {
      x: 95,
      y: top - 13 * commonFontSize,
      size: commonFontSize,
      font: timesRomanFont,
    });

    page.drawText(`${hotel.address}`, {
      x: 95,
      y: top - 14 * commonFontSize,
      size: commonFontSize,
      font: timesRomanFont,
    });

    page.drawText(`${hotel.email} / ${hotel.phone}`, {
      x: 95,
      y: top - 15 * commonFontSize,
      size: commonFontSize,
      font: timesRomanFont,
    });

    page.drawText('Room information', {
      x: 95,
      y: top - 14 * subTitleFontSize,
      size: subTitleFontSize,
      font: timesRomanFont,
    });

    page.drawText(`${room.name} - ${room.identifier}`, {
      x: 95,
      y: top - 19 * commonFontSize,
      size: commonFontSize,
      font: timesRomanFont,
    });

    page.drawText(`Maximum users: ${room.maxGuests}`, {
      x: 95,
      y: top - 20 * commonFontSize,
      size: commonFontSize,
      font: timesRomanFont,
    });

    page.drawText('Booking information', {
      x: 95,
      y: top - 18 * subTitleFontSize,
      size: subTitleFontSize,
      font: timesRomanFont,
    });

    page.drawText(`Id: ${booking.id}`, {
      x: 95,
      y: top - 24 * commonFontSize,
      size: commonFontSize,
      font: timesRomanFont,
    });

    page.drawText(`Price per day: $${booking.priceCents / 100}`, {
      x: 95,
      y: top - 25 * commonFontSize,
      size: commonFontSize,
      font: timesRomanFont,
    });

    page.drawText(`Total: $${booking.totalCents / 100}`, {
      x: 95,
      y: top - 26 * commonFontSize,
      size: commonFontSize,
      font: timesRomanFont,
    });

    confimationPdf.setTitle('Booking Confirmation');
    confimationPdf.setCreationDate(new Date());
    confimationPdf.setModificationDate(new Date());

    fs.writeFileSync(
      `${process.env.FILE_STORAGE_PATH}/${booking.id}.pdf`,
      await confimationPdf.save(),
    );
  }
}
