import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { Room, RoomProps } from 'src/entities/room.entity';
import { RoomRepository } from './room.repository';
import { RoomModel, RoomSchema } from './room.schema';
import { Hotel } from 'src/entities/hotel.entity';
import { HotelModel, HotelSchema } from '../hotel/hotel.schema';
import { HotelRepository } from '../hotel/hotel.repository';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Seed } from 'src/seeds/seed';

describe('RoomRepository', () => {
  let roomRepository: RoomRepository;
  let roomModel: Model<RoomModel>;
  let hotelModel: Model<HotelModel>;

  const seed = new Seed();
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
    hotel = await hotelRepository.create(seed.hotel.createProps());

    roomProps = seed.room.createProps({ hotelId: hotel.id });

    roomRepository = testModule.get<RoomRepository>(RoomRepository);
    roomModel = (roomRepository as any).roomModel;
  });

  afterEach(async () => {
    await roomModel.deleteMany();
    await hotelModel.deleteMany();
  });

  describe('create', () => {
    it('should create room in db', async () => {
      const room = await roomRepository.create(roomProps);

      checkRoom(room);
    });

    it('should throw an error if hotel does not exist', async () => {
      await expect(
        roomRepository.create({ ...roomProps, hotelId: 'other-uuid-here' }),
      ).rejects.toThrow(
        new HttpException('Hotel not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if hotel is missing', async () => {
      await expect(
        roomRepository.create({ ...roomProps, hotelId: null }),
      ).rejects.toThrow(
        new HttpException('Hotel not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('findOneById', () => {
    it('should find room by id', async () => {
      const existentHotel = await hotelModel.findById(hotel.id);
      const existentRoom = await roomModel.create({
        ...roomProps,
        hotel: existentHotel,
      });

      const room = await roomRepository.findOneById(existentRoom._id);

      checkRoom(room);
    });

    it('should return null if room does not exist', async () => {
      const room = await roomRepository.findOneById('other-uuid-here');

      expect(room).toBeNull;
    });
  });

  function checkRoom(room: Room) {
    expect(room.constructor.name).toBe(Room.name);
    expect(isUUID(room.id)).toBe(true);
    expect(room).toEqual({
      id: room.id,
      hotel,
      name: roomProps.name,
      identifier: roomProps.identifier,
      maxGuests: roomProps.maxGuests,
      oldPriceCents: roomProps.oldPriceCents,
      priceCents: roomProps.priceCents,
    });
  }
});
