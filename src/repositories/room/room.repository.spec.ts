import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { Room, RoomProps, RoomStatus } from 'src/entities/room.entity';
import { RoomRepository } from './room.repository';
import { RoomModel, RoomSchema } from './room.schema';
import { Hotel } from 'src/entities/hotel.entity';
import { HotelModel, HotelSchema } from '../hotel/hotel.schema';
import { HotelRepository } from '../hotel/hotel.repository';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('RoomRepository', () => {
  let roomRepository: RoomRepository;
  let hotelModel: Model<HotelModel>;
  let roomModel: Model<RoomModel>;

  let hotel: Hotel;
  let roomProps: RoomProps;

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        MongooseModule.forRoot(process.env.DATABASE_URI, {
          dbName: process.env.DATABASE_NAME,
        }),
        MongooseModule.forFeature([
          { name: HotelModel.name, schema: HotelSchema },
          { name: RoomModel.name, schema: RoomSchema },
        ]),
      ],
      providers: [HotelRepository, RoomRepository],
    }).compile();

    const hotelRepository = testModule.get<HotelRepository>(HotelRepository);
    hotelModel = (hotelRepository as any).hotelModel;

    hotel = await hotelRepository.create({
      name: 'Hotel Name',
      stars: 4.5,
      email: 'hotel@gmail.com',
      phone: '+5511922223333',
      address: 'Rua Abobrinha, 123, Cidade',
    });

    roomProps = {
      hotel,
      name: 'Room Name',
      identifier: '1203',
      status: RoomStatus.Available,
      maxGuests: 2,
      oldPriceCents: 18000,
      priceCents: 13000,
    };

    roomRepository = testModule.get<RoomRepository>(RoomRepository);
    roomModel = (roomRepository as any).roomModel;
  });

  afterEach(async () => {
    await roomModel.deleteMany();
  });

  describe('create', () => {
    it('should create room in db', async () => {
      const room = await roomRepository.create(roomProps);

      expect(room.constructor.name).toBe(Room.name);
      expect(isUUID(room.id)).toBeTruthy;
      expect(room).toEqual({
        id: room.id,
        hotel,
        name: roomProps.name,
        identifier: roomProps.identifier,
        status: roomProps.status,
        maxGuests: roomProps.maxGuests,
        oldPriceCents: roomProps.oldPriceCents,
        priceCents: roomProps.priceCents,
      });
    });

    it('should throw an error if hotel does not exist', async () => {
      await hotelModel.findByIdAndDelete(hotel.id);

      await expect(roomRepository.create(roomProps)).rejects.toThrow(
        new HttpException('Hotel not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if hotel is missing', async () => {
      await expect(
        roomRepository.create({ ...roomProps, hotel: null }),
      ).rejects.toThrow(
        new HttpException('Hotel not found', HttpStatus.NOT_FOUND),
      );
    });
  });
});
