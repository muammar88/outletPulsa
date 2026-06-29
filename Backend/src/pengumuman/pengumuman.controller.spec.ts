import { Test, TestingModule } from '@nestjs/testing';
import { PengumumanController } from './pengumuman.controller';

describe('PengumumanController', () => {
  let controller: PengumumanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PengumumanController],
    }).compile();

    controller = module.get<PengumumanController>(PengumumanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
