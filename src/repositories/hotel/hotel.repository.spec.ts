import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { isUUID } from 'class-validator';
import { Model } from 'mongoose';
import { HotelRepository } from './hotel.repository';
import { HotelModel, HotelSchema } from './hotel.schema';
import { Hotel, HotelProps } from 'src/entities/hotel.entity';

describe('HotelRepository', () => {
  let hotelRepository: HotelRepository;
  let hotelModel: Model<HotelModel>;

  const hotelProps: HotelProps = {
    name: 'Hotel Name',
    stars: 4.5,
    email: 'hotel@gmail.com',
    phone: '+5511922223333',
    address: 'Rua Abobrinha, 123, Cidade',
  };

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        MongooseModule.forRoot(process.env.DATABASE_URI, {
          dbName: process.env.DATABASE_NAME,
        }),
        MongooseModule.forFeature([
          { name: HotelModel.name, schema: HotelSchema },
        ]),
      ],
      providers: [HotelRepository],
    }).compile();

    hotelRepository = testModule.get<HotelRepository>(HotelRepository);
    hotelModel = (hotelRepository as any).hotelModel;
  });

  afterEach(async () => {
    await hotelModel.deleteMany();
  });

  describe('create', () => {
    it('should create hotel in db', async () => {
      const hotel = await hotelRepository.create(hotelProps);

      expect(hotel.constructor.name).toBe(Hotel.name);
      expect(isUUID(hotel.id)).toBe(true);
      expect(hotel).toEqual({
        id: hotel.id,
        name: hotelProps.name,
        stars: hotelProps.stars,
        email: hotelProps.email,
        phone: hotelProps.phone,
        address: hotelProps.address,
      });
    });
  });
});
