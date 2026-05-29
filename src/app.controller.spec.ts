import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: { getDanhSachTaiSan: jest.Mock };

  beforeEach(async () => {
    appService = {
      getDanhSachTaiSan: jest.fn().mockResolvedValue([{ MaTaiSan: 'TS0001' }]),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: appService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return asset rows from AppService', async () => {
      await expect(appController.getHello()).resolves.toEqual([{ MaTaiSan: 'TS0001' }]);
      expect(appService.getDanhSachTaiSan).toHaveBeenCalledTimes(1);
    });
  });
});
